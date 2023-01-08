import { Buffer } from 'buffer';
import SpotifyAPI from 'spotify-web-api-node';

import { GetStorageValue, SetStorageValue } from './utils';
import type { SpotifyTokensStorage } from './utils';

let SpotifyPlayer: SpotifyAPI;

type SpotifyTokens = {
    access_token: string
    refresh_token: string
    expires_in?: number | undefined
    createdAt?: number | undefined
}



//                     ________  ________  ________  _________  ___  ________ ___    ___ ___  ___  ________  ________   ________  ___       _______   ________     
//                    |\   ____\|\   __  \|\   __  \|\___   ___\\  \|\  _____\\  \  /  /|\  \|\  \|\   __  \|\   ___  \|\   ___ \|\  \     |\  ___ \ |\   __  \    
//                    \ \  \___|\ \  \|\  \ \  \|\  \|___ \  \_\ \  \ \  \__/\ \  \/  / | \  \\\  \ \  \|\  \ \  \\ \  \ \  \_|\ \ \  \    \ \   __/|\ \  \|\  \   
//                     \ \_____  \ \   ____\ \  \\\  \   \ \  \ \ \  \ \   __\\ \    / / \ \   __  \ \   __  \ \  \\ \  \ \  \ \\ \ \  \    \ \  \_|/_\ \   _  _\  
//                      \|____|\  \ \  \___|\ \  \\\  \   \ \  \ \ \  \ \  \_| \/  /  /   \ \  \ \  \ \  \ \  \ \  \\ \  \ \  \_\\ \ \  \____\ \  \_|\ \ \  \\  \| 
//                        ____\_\  \ \__\    \ \_______\   \ \__\ \ \__\ \__\__/  / /      \ \__\ \__\ \__\ \__\ \__\\ \__\ \_______\ \_______\ \_______\ \__\\ _\ 
//                       |\_________\|__|     \|_______|    \|__|  \|__|\|__|\___/ /        \|__|\|__|\|__|\|__|\|__| \|__|\|_______|\|_______|\|_______|\|__|\|__|
//                       \|_________|                                       \|___|/                                                                                




export default class SpotifyHandler {
    private static accessToken = "";
    private static refreshToken = "";
    private static tokenExpiresIn = 0;
    private static tokenCreatedAt = 0;
    private static clientId = "";
    private static clientSecret = "";
    private static redirectURI = "http://localhost:3000/auth_spotify";
    private static timeout: NodeJS.Timer | undefined;
    
    public static currentDevice: SpotifyApi.UserDevice | undefined;
    public static isOwner = true;
    public static isReady = false;

    public static SetCredentials(creds: { id: string, secret: string }) {
        SpotifyPlayer = new SpotifyAPI({
            clientId: creds.id,
            clientSecret: creds.secret,
            redirectUri: "http://localhost:3000/auth_spotify"
        });

        this.clientId = creds.id;
        this.clientSecret = creds.secret;
    }

    public static GetAuthLink() {
        return "https://accounts.spotify.com/authorize"
            + "?client_id=" + this.clientId
            + "&response_type=code"
            + "&redirect_uri=" + encodeURI(this.redirectURI)
            + "&show_dialog=true"
            + "&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-position%20user-library-read%20streaming%20user-read-playback-state%20user-read-recently-played%20playlist-read-private";
    }

    private static CallAuthorizationAPI(body: string) {
        fetch("https://accounts.spotify.com/api/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
            },
            body
        })
        .then(async resp => {
            if (resp.status == 200) {
                return resp.text();
            } else {
                console.error(`[CallAuthorizationAPI ${resp.status}] Error: ${resp.statusText}`);
            }
        })
        .then(body_text => {
            if (!body_text) {
                return console.error(`[CallAuthorization] Error: body empty`);
            }

            this.ProcessTokens(JSON.parse(body_text) as SpotifyTokens);
        })
        .catch(this.HandleError);
    }

    public static ProcessTokens(data: SpotifyTokens) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (data.access_token) {
            this.accessToken = data.access_token;
        }

        if (data.refresh_token) {
            this.refreshToken = data.refresh_token;
        }

        this.tokenCreatedAt = data.createdAt || Date.now();
        // expires_in 3600 * 1000 in ms => 1h ; (1000 * 60 * 60) 60 min => 1h
        const expires_in = data.expires_in && data.expires_in > 0 && data.expires_in <= 3600
            ? (data.expires_in * 1000)
            : (1000 * 60 * 60);
        const msDiff = (this.tokenCreatedAt + expires_in) - Date.now();

        if (msDiff <= 0) {
            return this.RefreshAccessToken();
        }

        this.TokenFetchingEnded()
        this.timeout = setTimeout(
            this.RefreshAccessToken,
            (this.tokenCreatedAt + expires_in) - Date.now()
        );
    }

    public static FetchAccessToken(code: string) {
        let body = "grant_type=authorization_code"
            + "&code=" + code 
            + "&redirect_uri=" + encodeURI(this.redirectURI)
            + "&client_id=" + this.clientId
            + "&client_secret=" + this.clientSecret;
        this.CallAuthorizationAPI(body);
    }

    private static RefreshAccessToken() {
        let body = "grant_type=refresh_token"
            + "&refresh_token=" + this.refreshToken
            + "&client_id=" + this.clientId
        this.CallAuthorizationAPI(body);
    }

    public static async TokenFetchingEnded() {
        SpotifyPlayer.setAccessToken(this.accessToken);
        SpotifyPlayer.setRefreshToken(this.refreshToken);

        SetStorageValue({
            st: {
                at: this.accessToken,
                rt: this.refreshToken,
                ein: this.tokenExpiresIn,
                date: this.tokenCreatedAt
            }
        });

        const deviceName = GetStorageValue("SpotifyDevice");

        try {
            const resp = await SpotifyPlayer.getMyDevices();
            this.currentDevice = deviceName
                ? resp.body?.devices.find(device => device.name == deviceName)
                : resp.body?.devices.find(device => device.is_active);

            if (this.currentDevice) {
                SetStorageValue({ SpotifyDevice: JSON.stringify(this.currentDevice) });
            }
        } catch (error) {
            //location.replace(this.GetAuthLink());
            this.HandleError(error as Error);
            return;
        }

        this.isReady = true;
    }

    private static HandleError(error: Error) {
        if (error.message == "An error occurred while communicating with Spotify's Web API.\nDetails: No token provided.") return;

        console.error(error);
    }

    private static LinkToURI(link: string) {
        return `spotify:track:${link.split('/').pop()}`.split('?').length > 1
            ? `spotify:track:${link.split('/').pop()?.split('?').shift()}`
            : `spotify:track:${link.split('/').pop()}`;
    }
    
    public static GetTokens() {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expires_in: this.tokenExpiresIn,
            date: this.tokenCreatedAt
        }
    }

    private static SetTokens() {
        const tokens = GetStorageValue("st");

        if (tokens == null) {
            throw new Error("No Spotify tokens on local storage");
        }

        this.ProcessTokens({
            access_token: tokens.at,
            refresh_token: tokens.rt,
            expires_in: tokens.ein,
            createdAt: tokens.date
        });
    }

    static Disconnect() {
        this.isReady = false;
        this.accessToken = "";
        this.refreshToken = "";
        this.tokenExpiresIn = 0;
        this.tokenCreatedAt = 0;

        SetStorageValue({ st: null });
    }

    static Pause() {
        this.SetTokens();
        return new Promise<SpotifyHandler>((resolve, reject) => {
            SpotifyPlayer
                .pause({ device_id: this.currentDevice?.id || undefined })
                .then(() => resolve(this))
                .catch((error: Error) => reject(new Error(`There was an error pausing track. (${error})`)));
        });
    }

    static Resume() {
        this.SetTokens();
        return new Promise<SpotifyHandler>((resolve, reject) => {
            SpotifyPlayer
                .play({ device_id: this.currentDevice?.id || undefined })
                .then(() => resolve(this))
                .catch((error: Error) => reject(new Error(`There was an error resuming track. (${error})`)));
        });
    }

    static AddNextTrack(link: string) {
        this.SetTokens();
        return new Promise<void | Error>((resolve, reject) => {
            SpotifyPlayer
                .addToQueue(this.LinkToURI(link))
                .then(() => resolve())
                .catch((error: Error) => reject(new Error(`There was an error adding track to the queue. (${error})`)));
        });
    }

    static SkipToPrevious() {
        this.SetTokens();
        return new Promise<SpotifyHandler>((resolve, reject) => {
            SpotifyPlayer
                .skipToPrevious({ device_id: this.currentDevice?.id || undefined })
                .then(() => resolve(this))
                .catch((error: Error) => reject(new Error(`There was an error skiping to previous track. (${error})`)));
        });
    }

    static SkipToNext() {
        this.SetTokens();
        return new Promise<SpotifyHandler>((resolve, reject) => {
            SpotifyPlayer
                .skipToNext({ device_id: this.currentDevice?.id || undefined })
                .then(() => resolve(this))
                .catch((error: Error) => reject(new Error(`There was an error skiping to next track. (${error})`)));
        });
    }

    static GetRecentlyPlayedTracks(limit: number) {
        this.SetTokens();
        return new Promise<Array<SpotifyApi.PlayHistoryObject | Error>>((resolve, reject) => {
            SpotifyPlayer
                .getMyRecentlyPlayedTracks({ limit: limit })
                .then((data: any) => resolve(data.body.items))
                .catch((error: Error) => reject(new Error(`There was an error showing the ${limit} recently played tracks. (${error})`)));
        });
    }

    static SetVolume(value: number) {
        this.SetTokens();
        SpotifyPlayer.setVolume(value, { device_id: this.currentDevice?.id || undefined });
    }

    static GetCurrentTrackData() {
        this.SetTokens();
        return new Promise<SpotifyApi.CurrentPlaybackResponse | Error>((resolve, reject) => {
            SpotifyPlayer
                .getMyCurrentPlaybackState()
                .then(val => resolve(val.body))
                .catch((error: Error) => reject(new Error(`There was an error getting current playback response (${error})`)));
        });
    }

    static SearchTracks(input: string) {
        this.SetTokens();
        return new Promise<SpotifyApi.SearchResponse | Error>((resolve, reject) => {
            SpotifyPlayer
                .searchTracks(input, { limit: 10 })
                .then(resp => resolve(resp.body))
                .catch((error: Error) => reject(new Error(`There was an error searching for tracks with ${input} (${error})`)));
        });
    }

    static GetDevices() {
        this.SetTokens();
        return new Promise<Array<SpotifyApi.UserDevice> | Error>((resolve, reject) => {
            SpotifyPlayer
                .getMyDevices()
                .then(resp => resp.body)
                .then(body => resolve(body.devices))
                .catch((error: Error) => reject(new Error(`There was an error searching for devices (${error})`)));
        });
    }

    static Seek(position: number) {
        this.SetTokens();
        return new Promise<void | Error>((resolve, reject) => {
            SpotifyPlayer
                .seek(position, { device_id: this.currentDevice?.id || undefined })
                .then(() => resolve())
                .catch((error: Error) => reject(new Error(`There was an error seeking to ${position} (${error})`)));
        });
    }

    static GetProfile(): Promise<Error> | Promise<SpotifyApi.CurrentUsersProfileResponse | Error> {
        if (!this.isOwner) {
            this.Disconnect();
            return new Promise<Error>((_, reject) => reject(new Error()));
        }

        this.SetTokens();
        return new Promise<SpotifyApi.CurrentUsersProfileResponse | Error>((resolve, reject) => {
            SpotifyPlayer
                .getMe()
                .then(resp => resp.body)
                .then(body => resolve(body))
                .catch((error: Error) => reject(new Error(`There was an error getting profile (${error})`)));
        });
    }

    static GetCurrentQueueData() {
        this.SetTokens();
        return new Promise<SpotifyApi.UsersQueueResponse | Error>((resolve, reject) => {
            fetch("https://api.spotify.com/v1/me/player/queue", {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.accessToken}`
                },
                method: "GET",
            })
            .then(resp => resp.json())
            .then(body => resolve(body))
            .catch((error: Error) => reject(error));
        });
    }

    static SetDevice(device: SpotifyApi.UserDevice) {
        this.currentDevice = device;
    }
}
