import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { UserProfile, Device } from "@spotify/web-api-ts-sdk";
import { env } from "$env/dynamic/public";
import { writable } from "svelte/store";

import { get_storage_value, set_storage_value, type SpotifyTokens } from "$/lib/utils";

type MaxInt<T extends number> = number extends T ? number : _Range<T, []>;
type _Range<T extends number, R extends unknown[]> = R["length"] extends T
    ? R[number] | T
    : _Range<T, [R["length"], ...R]>;

const tokens_default: SpotifyTokens = {
    access_token: "",
    refresh_token: "",
    expires_in: 0,
    created_at: 0,
} as const;

//                     ________  ________  ________  _________  ___  ________ ___    ___ ___  ___  ________  ________   ________  ___       _______   ________
//                    |\   ____\|\   __  \|\   __  \|\___   ___\\  \|\  _____\\  \  /  /|\  \|\  \|\   __  \|\   ___  \|\   ___ \|\  \     |\  ___ \ |\   __  \
//                    \ \  \___|\ \  \|\  \ \  \|\  \|___ \  \_\ \  \ \  \__/\ \  \/  / | \  \\\  \ \  \|\  \ \  \\ \  \ \  \_|\ \ \  \    \ \   __/|\ \  \|\  \
//                     \ \_____  \ \   ____\ \  \\\  \   \ \  \ \ \  \ \   __\\ \    / / \ \   __  \ \   __  \ \  \\ \  \ \  \ \\ \ \  \    \ \  \_|/_\ \   _  _\
//                      \|____|\  \ \  \___|\ \  \\\  \   \ \  \ \ \  \ \  \_| \/  /  /   \ \  \ \  \ \  \ \  \ \  \\ \  \ \  \_\\ \ \  \____\ \  \_|\ \ \  \\  \|
//                        ____\_\  \ \__\    \ \_______\   \ \__\ \ \__\ \__\__/  / /      \ \__\ \__\ \__\ \__\ \__\\ \__\ \_______\ \_______\ \_______\ \__\\ _\
//                       |\_________\|__|     \|_______|    \|__|  \|__|\|__|\___/ /        \|__|\|__|\|__|\|__|\|__| \|__|\|_______|\|_______|\|_______|\|__|\|__|
//                       \|_________|                                       \|___|/

export class SpotifyHandler {
    public static readonly BACK_API = `${env.PUBLIC_SERVER_ADDR_DEV}/sharify`; // TODO: handle public server addr

    private sdk: SpotifyApi | null = null;
    private tokens = tokens_default;
    private client_id = "";
    private redirectURI = env.PUBLIC_SPOTIFY_REDIRECT;
    private scopes = [
        "user-read-private",
        "user-read-email",
        "user-modify-playback-state",
        "user-read-playback-position",
        "user-library-read",
        "streaming",
        "user-read-playback-state",
        "user-read-recently-played",
        "playlist-read-private",
    ];
    private timeout: ReturnType<typeof setTimeout> | null = null;
    private code_verifier = "";
    private code_challenge = "";

    public current_device: Device | null = null;
    public current_profile: UserProfile | null = null;
    public is_ready = false;

    constructor(client_id: string) {
        if (client_id == "") {
            throw new Error("No client id provided");
        }

        this.client_id = client_id;
    }

    public InitSdk() {
        this.sdk = SpotifyApi.withAccessToken(
            this.client_id,
            {
                ...this.tokens,
                token_type: "code",
            },
            { afterRequest: this.HandleRequests },
        );
    }

    /**
     * May throw Error on status 429 rate limiter server side
     */
    public async GenerateAuthLink() {
        try {
            let res = await fetch(`${SpotifyHandler.BACK_API}/code_verifier`, { method: "GET" });
            if (res.status == 429) {
                throw new Error("Error: Too many tries, please try again later");
            }
            this.code_verifier = await res.text();

            set_storage_value({ code_verifier: this.code_verifier });

            res = await fetch(`${SpotifyHandler.BACK_API}/code_challenge/${this.code_verifier}`, { method: "GET" });
            if (res.status == 429) {
                throw new Error("Error: Too many tries, please try again later");
            }
            this.code_challenge = await res.text();

            const url = new URL("https://accounts.spotify.com/authorize");

            url.search = new URLSearchParams({
                client_id: this.client_id,
                response_type: "code",
                redirect_uri: encodeURI(this.redirectURI),
                show_dialog: "true",
                scope: this.scopes.join(" "),
                code_challenge_method: "S256",
                code_challenge: this.code_challenge,
            }).toString();

            return url.toString();
        } catch (error: any) {
            console.error(error);
            return new Error(error);
        }
    }

    /**
     * Can throw Error on failed request, bad status code or empty body
     */
    private async CallAuthorizationAPI(body: URLSearchParams) {
        try {
            const res = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body,
            });

            if (res.status != 200) {
                const error = new Error(
                    `[CallAuthorizationAPI ${res.status}] Error: ${res.statusText} Response text: ${await res.text()}; Body supplied: ${body}`,
                );
                console.error(error);
                throw error;
            }

            const json: SpotifyTokens = await res.json();

            if (!json || !json.access_token) {
                console.error(res);
                throw new Error(
                    `[CallAuthorizationAPI] Error: empty body. Response json: ${json}; Body supplied: ${body}`,
                );
            }

            this.ProcessTokens(json);
        } catch (error) {
            console.error(error);
        }
    }

    // TODO: Fix refresh token trigger
    public ProcessTokens(data: Partial<SpotifyTokens>) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.tokens = { ...tokens_default, ...data };
        this.tokens.created_at = data.created_at ?? Date.now();

        // expires_in (usually 3k6s, so) 3600 * 1000 in ms => 1h ; (1000 * 60 * 60) 60 min => 1h as default
        const expires_in =
            this.tokens.expires_in && this.tokens.expires_in > 0 ? this.tokens.expires_in * 1000 : 1000 * 60 * 60;

        const msDiff = this.tokens.created_at + expires_in - Date.now();
        if (msDiff <= 0) {
            return this.RefreshAccessToken();
        }

        this.timeout = setTimeout(this.RefreshAccessToken, msDiff);
        this.TokenFetchingEnded();
    }

    public FetchAccessToken(code: string) {
        const code_verifier = get_storage_value("code_verifier");

        if (code_verifier == null) {
            throw new Error("No code verifier on local storage");
        }

        const params = new URLSearchParams({
            client_id: this.client_id,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: encodeURI(this.redirectURI),
            code_verifier: code_verifier,
        });

        this.CallAuthorizationAPI(params);
    }

    private RefreshAccessToken() {
        const params = new URLSearchParams({
            client_id: this.client_id,
            grant_type: "refresh_token",
            refresh_token: this.tokens.refresh_token,
        });

        this.CallAuthorizationAPI(params);
    }

    public async TokenFetchingEnded() {
        if (this.tokens.access_token != tokens_default.access_token) {
            set_storage_value({ spotify_tokens: this.tokens });
        }

        this.InitSdk();
        this.is_ready = true;

        const current_device = get_storage_value("spotify_device");

        try {
            const [{ devices }, user] = await Promise.all([
                this.sdk!.player.getAvailableDevices(),
                this.sdk!.currentUser.profile(),
            ]);

            this.current_device =
                (current_device
                    ? devices.find(device => device.id == current_device.id)
                    : devices.find(device => device.is_active)) ?? null;
            this.current_profile = user;

            if (this.current_device) {
                set_storage_value({ spotify_device: this.current_device });
            }

            set_storage_value({ spotify_profile: user });
        } catch (error) {
            //location.replace(this.GetAuthLink());
            console.error(error);
            return;
        }
    }

    private LinkToURI(link: string) {
        return `spotify:track:${link.split("/").pop()}`.split("?").length > 1
            ? `spotify:track:${link.split("/").pop()?.split("?").shift()}`
            : `spotify:track:${link.split("/").pop()}`;
    }

    public GetTokens() {
        return this.tokens;
    }

    private SetTokens() {
        const tokens = get_storage_value("spotify_tokens");

        if (tokens == null) {
            throw new Error("No Spotify tokens on local storage");
        }

        this.ProcessTokens(tokens);
    }

    private EnsureInitialized() {
        if (this.is_ready) {
            return;
        }

        this.SetTokens();
    }

    static ExceededQota<T extends { status: number }>(request: T): boolean {
        // Handle retry-after HEADER

        return request.status == 429;
    }

    private HandleRequests(_url: string, _options: RequestInit, response: Response) {
        if (SpotifyHandler.ExceededQota(response)) {
            throw new Error("Spotify API Quota excedeed, be patient");
        }
    }

    Disconnect() {
        this.is_ready = false;
        this.tokens = tokens_default;
        this.current_device = null;
        this.current_profile = null;
        this.sdk = null;
        this.code_verifier = "";
        this.code_challenge = "";

        set_storage_value({ spotify_tokens: null, code_verifier: null, spotify_profile: null, spotify_device: null });
    }

    async Pause() {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.pausePlayback(this.current_device?.id ?? "");

            return this;
        } catch (error) {
            throw new Error(`There was an error pausing track. (${error})`);
        }
    }

    async Resume() {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.startResumePlayback(this.current_device?.id ?? "");

            return this;
        } catch (error) {
            throw new Error(`There was an error resuming track. (${error})`);
        }
    }

    async AddNextTrack(link: string) {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.addItemToPlaybackQueue(this.LinkToURI(link), this.current_device?.id ?? "");

            return;
        } catch (error) {
            throw new Error(`There was an error adding track to the queue. (${error})`);
        }
    }

    async SkipToPrevious() {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.skipToPrevious(this.current_device?.id ?? "");

            return this;
        } catch (error) {
            throw new Error(`There was an error skiping to previous track. (${error})`);
        }
    }

    async SkipToNext() {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.skipToNext(this.current_device?.id ?? "");

            return this;
        } catch (error) {
            throw new Error(`There was an error skiping to next track. (${error})`);
        }
    }

    async GetRecentlyPlayedTracks(limit: MaxInt<50>) {
        this.EnsureInitialized();
        try {
            const { items } = await this.sdk!.player.getRecentlyPlayedTracks(limit);

            return items;
        } catch (error) {
            throw new Error(`There was an error showing the ${limit} recently played tracks. (${error})`);
        }
    }

    async SetVolume(value: number) {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.setPlaybackVolume(value, this.current_device?.id ?? "");

            return;
        } catch (error) {
            throw new Error(`There was an error setting volume to ${value}. (${error})`);
        }
    }

    async GetCurrentTrackData() {
        this.EnsureInitialized();
        try {
            const state = await this.sdk!.player.getPlaybackState();

            return state;
        } catch (error) {
            throw new Error(`There was an error getting current playback response (${error})`);
        }
    }

    async SearchTracks(input: string) {
        this.EnsureInitialized();
        try {
            // @ts-expect-ignore
            const res = await this.sdk!.search(input, ["tracks"], undefined, 10);

            return res;
        } catch (error) {
            throw new Error(`There was an error searching for tracks with ${input} (${error})`);
        }
    }

    async GetDevices() {
        this.EnsureInitialized();
        try {
            const { devices } = await this.sdk!.player.getAvailableDevices();

            return devices;
        } catch (error) {
            throw new Error(`There was an error searching for devices (${error})`);
        }
    }

    async Seek(position: number) {
        this.EnsureInitialized();
        try {
            await this.sdk!.player.seekToPosition(position, this.current_device?.id ?? "");

            return;
        } catch (error) {
            throw new Error(`There was an error seeking to ${position} (${error})`);
        }
    }

    async GetProfile(): Promise<UserProfile | Error> {
        this.EnsureInitialized();
        try {
            const profile = await this.sdk!.currentUser.profile();

            return profile;
        } catch (error) {
            throw new Error(`There was an error getting profile (${error})`);
        }
    }

    async GetCurrentQueueData() {
        this.EnsureInitialized();
        try {
            const queue = await this.sdk!.player.getUsersQueue();

            return queue;
        } catch (error) {
            throw new Error(`There was an error getting current queue data (${error})`);
        }
    }

    // TODO
    SetDevice(device: Device) {
        this.current_device = device;
    }
}

const store = writable<SpotifyHandler | null>(null);

store.update(x => {
    if (x != null) return x;

    return new SpotifyHandler(env.PUBLIC_SPOTIFY_CLIENT_ID!);
});

export default store;
