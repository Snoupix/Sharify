import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { UserProfile } from "@spotify/web-api-ts-sdk";
import { env } from "$env/dynamic/public";
import { writable } from "svelte/store";

import { get_storage_value, set_storage_value, type SpotifyTokens } from "$lib/utils";

const TOKENS_DEFAULT: SpotifyTokens = {
	access_token: "",
	refresh_token: "",
	expires_in: 0,
	created_at: 0,
} as const;

export class SpotifyHandler {
	public static readonly BACK_API = `${env.PUBLIC_SERVER_ADDR_DEV}/v1`; // TODO: handle public server addr

	private sdk: SpotifyApi | null = null;
	private tokens = TOKENS_DEFAULT;
	private client_id = "";
	private redirectURI = `${location.origin}/auth_spotify`;
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

	public current_profile: UserProfile | null = null;
	public is_ready = false;

	constructor(client_id: string) {
		if (client_id.length === 0) {
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
			if (res.status === 429) {
				throw new Error("Error: Too many tries, please try again later");
			}
			this.code_verifier = await res.text();

			set_storage_value({ code_verifier: this.code_verifier });

			res = await fetch(`${SpotifyHandler.BACK_API}/code_challenge/${this.code_verifier}`, { method: "GET" });
			if (res.status === 429) {
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
		} catch (error) {
			console.error(error);
			return new Error(error as string);
		}
	}

	private async CallAuthorizationAPI(body: URLSearchParams) {
		try {
			const res = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body,
			});

			if (res.status !== 200) {
				throw new Error(
					`[CallAuthorizationAPI ${res.status}] Error: ${res.statusText} Response text: ${await res.text()}; Body supplied: ${body}`,
				);
			}

			const json: SpotifyTokens = await res.json();

			if (!json || !json.access_token) {
				throw new Error(
					`[CallAuthorizationAPI] Error: empty body. Response json: ${json}; Body supplied: ${body}`,
				);
			}

			this.ProcessTokens(json);
		} catch (error) {
			console.error(error);
			this.Disconnect();
		}
	}

	public ProcessTokens(data: Partial<SpotifyTokens>) {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.tokens = { ...TOKENS_DEFAULT, ...data };
		this.tokens.created_at = data.created_at ?? Date.now();

		// Only handle the Refresh Token at first load, then if it's old, get a new, if its valid,
		// let the backend handle it
		//
		// expires_in (usually 3k6s, so) 3600 * 1000 in ms => 1h ; (1000 * 60 * 60) 60 min => 1h as default
		const expires_in =
			this.tokens.expires_in && this.tokens.expires_in > 0 ? this.tokens.expires_in * 1000 : 1000 * 60 * 60;

		const msDiff = this.tokens.created_at + expires_in - Date.now();
		if (msDiff <= 0) {
			return this.RefreshAccessToken();
		}

		this.TokenFetchingEnded();
	}

	public FetchAccessToken(code: string) {
		const code_verifier = get_storage_value("code_verifier");

		if (code_verifier === null) {
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
		if (this.tokens.access_token !== TOKENS_DEFAULT.access_token) {
			set_storage_value({ spotify_tokens: this.tokens });
		}

		this.InitSdk();
		this.is_ready = true;

		try {
			const user = await this.sdk!.currentUser.profile();

			this.current_profile = user;

			set_storage_value({ spotify_profile: user });
		} catch (error) {
			//location.replace(this.GetAuthLink());
			console.warn(error);

			this.Disconnect();

			return;
		}
	}

	private LinkToURI(link: string) {
		const id = link.split("/").pop();

		return `spotify:track:${id}`.split("?").length > 1
			? // Has query
				`spotify:track:${id?.split("?").shift()}`
			: `spotify:track:${id}`;
	}

	public GetTokens() {
		return this.tokens;
	}

	public SetTokens() {
		if (this.is_ready) {
			return;
		}

		const tokens = get_storage_value("spotify_tokens");

		if (tokens === null) {
			console.warn("No Spotify tokens on local storage");
			return;
		}

		this.ProcessTokens(tokens);
	}

	private EnsureInitialized() {
		if (this.is_ready) {
			return;
		}

		this.SetTokens();
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

	static ExceededQota<T extends { status: number }>(request: T): boolean {
		// Handle retry-after HEADER

		return request.status === 429;
	}

	private HandleRequests(_url: string, _options: RequestInit, response: Response) {
		if (SpotifyHandler.ExceededQota(response)) {
			throw new Error("Spotify API Quota excedeed, be patient");
		}
	}

	Disconnect() {
		this.is_ready = false;
		this.tokens = TOKENS_DEFAULT;
		this.current_profile = null;
		this.sdk = null;
		this.code_verifier = "";
		this.code_challenge = "";

		set_storage_value({ spotify_tokens: null, code_verifier: null, spotify_profile: null });
	}
}

const store = writable<SpotifyHandler | null>(null);

store.update((x) => {
	if (x !== null) return x;

	return new SpotifyHandler(env.PUBLIC_SPOTIFY_CLIENT_ID!);
});

export default store;
