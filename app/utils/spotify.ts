import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { PlayHistory,PlaybackState, UserProfile, Queue, SearchResults } from "@spotify/web-api-ts-sdk";

import { GetStorageValue, SetStorageValue } from './utils';

type MaxInt<T extends number> = number extends T ? number : _Range<T, []>;
type _Range<T extends number, R extends unknown[]> = R['length'] extends T ? R[number] | T : _Range<T, [R['length'], ...R]>;

type SpotifyTokens = {
    access_token:   string
    refresh_token:  string
    expires_in:     number
    created_at:     number
}

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




export default class SpotifyHandler {
    public static readonly BACK_API = "http://localhost:3100/sharify";

    private sdk: SpotifyApi | null = null;
    private tokens = tokens_default;
    private client_id = "";
    private redirectURI = "http://localhost:3000/auth_spotify";
    private scopes = "user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    private timeout: ReturnType<typeof setTimeout> | null =  null;
    private code_verifier = "";
    private code_challenge = "";
    
    public current_device: SpotifyApi.UserDevice | undefined;
    public is_owner = true;
    public is_ready = false;

    constructor(client_id: string) {
        if (client_id == "") {
            throw new Error("No client id provided");
        }

        this.client_id = client_id;
    }

    public InitSdk() {
        this.sdk = SpotifyApi.withAccessToken(this.client_id, {
            ...this.tokens,
            token_type: "code",
        }, { afterRequest: this.HandleRequests });
    }

    public async GenerateAuthLink() {
        try {
            let res = await fetch(`${SpotifyHandler.BACK_API}/code_verifier`, { method: "GET" });
            this.code_verifier = await res.text();

            SetStorageValue({ code_verifier: this.code_verifier });

            res = await fetch(`${SpotifyHandler.BACK_API}/code_challenge/${this.code_verifier}`, { method: "GET" });
            this.code_challenge = await res.text();

            const url = new URL("https://accounts.spotify.com/authorize");

            url.search = new URLSearchParams({
                "client_id": this.client_id,
                "response_type": "code",
                "redirect_uri": encodeURI(this.redirectURI),
                "show_dialog": "true",
                "scope": this.scopes,
                "code_challenge_method": 'S256',
                "code_challenge": this.code_challenge,
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body
            });

            if (res.status != 200) {
                const error = new Error(`[CallAuthorizationAPI ${res.status}] Error: ${res.statusText} Response text: ${await res.text()}; Body supplied: ${body}`);
                console.error(error);
                throw error;
            }

            const json: SpotifyTokens = await res.json();

            if (!json || !json.access_token) {
                console.error(res);
                throw new Error(`[CallAuthorizationAPI] Error: empty body. Response json: ${json}; Body supplied: ${body}`);
            }

            this.ProcessTokens(json);
        } catch (error: any) {
            console.error(error);
        }
    }

    public ProcessTokens(data: Partial<SpotifyTokens>) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.tokens = { ...tokens_default, ...data };
        this.tokens.created_at = data.created_at ?? Date.now();

        // expires_in (usually 3k6s, so) 3600 * 1000 in ms => 1h ; (1000 * 60 * 60) 60 min => 1h as default
        const expires_in = this.tokens.expires_in && this.tokens.expires_in > 0
            ? (this.tokens.expires_in * 1000)
            : (1000 * 60 * 60);

        const msDiff = (this.tokens.created_at + expires_in) - Date.now();
        if (msDiff <= 0) {
            return this.RefreshAccessToken();
        }

        this.timeout = setTimeout(
            this.RefreshAccessToken,
            msDiff
        );
        this.TokenFetchingEnded()
    }

    public FetchAccessToken(code: string) {
        const code_verifier = GetStorageValue("code_verifier");

        if (code_verifier == null) {
            throw new Error("No code verifier on local storage");
        }

        const params = new URLSearchParams({
            "client_id": this.client_id,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": encodeURI(this.redirectURI),
            "code_verifier": code_verifier,
        });

        this.CallAuthorizationAPI(params);
    }

    private RefreshAccessToken() {
        const params = new URLSearchParams({
            "client_id": this.client_id,
            "grant_type": "refresh_token",
            "refresh_token": this.tokens.refresh_token,
        });

        this.CallAuthorizationAPI(params);
    }

    public async TokenFetchingEnded() {
        SetStorageValue({
            st: {
                at: this.tokens.access_token,
                rt: this.tokens.refresh_token,
                ein: this.tokens.expires_in,
                date: this.tokens.created_at
            }
        });

        const deviceName = GetStorageValue("SpotifyDevice");

        try {
            const { devices } = await this.sdk!.player.getAvailableDevices();
            this.current_device = deviceName
                ? devices.find(device => device.name == deviceName)
                : devices.find(device => device.is_active);

            if (this.current_device) {
                SetStorageValue({ SpotifyDevice: JSON.stringify(this.current_device) });
            }
        } catch (error) {
            //location.replace(this.GetAuthLink());
            console.error(error);
            return;
        }

        this.InitSdk();
        this.is_ready = true;
    }

    private LinkToURI(link: string) {
        return `spotify:track:${link.split('/').pop()}`.split('?').length > 1
            ? `spotify:track:${link.split('/').pop()?.split('?').shift()}`
            : `spotify:track:${link.split('/').pop()}`;
    }
    
    public GetTokens() {
        return this.tokens;
    }

    private SetTokens() {
        const tokens = GetStorageValue("st");

        if (tokens == null) {
            throw new Error("No Spotify tokens on local storage");
        }

        this.ProcessTokens({
            access_token: tokens.at,
            refresh_token: tokens.rt,
            expires_in: tokens.ein,
            created_at: tokens.date
        });
    }

    private EnsureInitialized() {
        if (this.is_ready) {
            return;
        }

        this.SetTokens();
    }

    private ExceededQota<T extends { status: number }>(request: T): boolean {
        // Handle retry-after HEADER

        return request.status == 429;
    }

    private HandleRequests(_url: string, _options: RequestInit, response: Response) {
        if (this.ExceededQota(response)) {
            throw new Error("Spotify API Quota excedeed, be patient");
        }
    }


    Disconnect() {
        this.is_ready = false;
        this.tokens = tokens_default;

        SetStorageValue({ st: null });
    }

    Pause() {
        this.EnsureInitialized();
        return new Promise<SpotifyHandler>(async (resolve, reject) => {
            try {
                await this.sdk!.player.pausePlayback(this.current_device?.id ?? "");

                resolve(this);
            } catch (error: any) {
                reject(new Error(`There was an error pausing track. (${error})`));
            }
        });
    }

    Resume() {
        this.EnsureInitialized();
        return new Promise<SpotifyHandler>(async (resolve, reject) => {
            try {
                await this.sdk!.player.startResumePlayback(this.current_device?.id ?? "");

                resolve(this);
            } catch (error: any) {
                reject(new Error(`There was an error resuming track. (${error})`));
            }
        });
    }

    AddNextTrack(link: string) {
        this.EnsureInitialized();
        return new Promise<void | Error>(async (resolve, reject) => {
            try {
                await this.sdk!.player.addItemToPlaybackQueue(this.LinkToURI(link), this.current_device?.id ?? "");

                resolve();
            } catch (error: any) {
                reject(new Error(`There was an error adding track to the queue. (${error})`));
            }
        });
    }

    SkipToPrevious() {
        this.EnsureInitialized();
        return new Promise<SpotifyHandler>(async (resolve, reject) => {
            try {
                await this.sdk!.player.skipToPrevious(this.current_device?.id ?? "");

                resolve(this);
            } catch (error: any) {
                reject(new Error(`There was an error skiping to previous track. (${error})`));
            }
        });
    }

    SkipToNext() {
        this.EnsureInitialized();
        return new Promise<SpotifyHandler>(async (resolve, reject) => {
            try {
                await this.sdk!.player.skipToNext(this.current_device?.id ?? "");

                resolve(this);
            } catch (error: any) {
                reject(new Error(`There was an error skiping to next track. (${error})`));
            }
        });
    }

    GetRecentlyPlayedTracks(limit: MaxInt<50>) {
        this.EnsureInitialized();
        return new Promise<Array<PlayHistory> | Error>(async (resolve, reject) => {
            try {
                const { items } = await this.sdk!.player.getRecentlyPlayedTracks(limit);

                resolve(items);
            } catch (error: any) {
                reject(new Error(`There was an error showing the ${limit} recently played tracks. (${error})`));
            }
        });
    }

    SetVolume(value: number) {
        this.EnsureInitialized();
        return new Promise<void | Error>(async (resolve, reject) => {
            try {
                await this.sdk!.player.setPlaybackVolume(value, this.current_device?.id ?? "");

                resolve();
            } catch (error: any) {
                reject(new Error(`There was an error setting volume to ${value}. (${error})`));
            }
        });
    }

    GetCurrentTrackData() {
        this.EnsureInitialized();
        return new Promise<PlaybackState | Error>(async (resolve, reject) => {
            try {
                const state = await this.sdk!.player.getPlaybackState();

                resolve(state);
            } catch (error: any) {
                reject(new Error(`There was an error getting current playback response (${error})`));
            }
        });
    }

    SearchTracks(input: string) {
        this.EnsureInitialized();
        return new Promise<SearchResults<Array<"track">> | Error>(async (resolve, reject) => {
            try {
                // @ts-ignore
                const res = await this.sdk!.search(input, ["tracks"], undefined, 10);

                resolve(res);
            } catch (error: any) {
                reject(new Error(`There was an error searching for tracks with ${input} (${error})`));
            }
        });
    }

    GetDevices() {
        this.EnsureInitialized();
        return new Promise<Array<SpotifyApi.UserDevice> | Error>(async (resolve, reject) => {
            try {
                const { devices } = await this.sdk!.player.getAvailableDevices();

                resolve(devices);
            } catch (error: any) {
                reject(new Error(`There was an error searching for devices (${error})`));
            }
        });
    }

    Seek(position: number) {
        this.EnsureInitialized();
        return new Promise<void | Error>(async (resolve, reject) => {
            try {
                await this.sdk!.player.seekToPosition(position, this.current_device?.id ?? "");

                resolve();
            } catch (error: any) {
                reject(new Error(`There was an error seeking to ${position} (${error})`))
            }
        });
    }

    GetProfile(): Promise<UserProfile | Error> {
        if (!this.is_owner) {
            this.Disconnect();
            return new Promise<Error>((_, reject) => reject(new Error()));
        }

        this.EnsureInitialized();
        return new Promise<UserProfile | Error>(async (resolve, reject) => {
            try {
                const profile = await this.sdk!.currentUser.profile();

                resolve(profile);
            } catch (error: any) {
                reject(new Error(`There was an error getting profile (${error})`))
            }
        });
    }

    GetCurrentQueueData() {
        this.EnsureInitialized();
        return new Promise<Queue | Error>(async (resolve, reject) => {
            try {
                const queue = await this.sdk!.player.getUsersQueue();

                resolve(queue);
            } catch (error: any) {
                reject(new Error(`There was an error getting current queue data (${error})`));
            }
        });
    }

    SetDevice(device: SpotifyApi.UserDevice) {
        this.current_device = device;
    }
}
