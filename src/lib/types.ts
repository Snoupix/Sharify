import type { Session } from "@auth/sveltekit";

export type PartyID = number;
export type PartyClientID = string;

export type Party = {
    id: PartyID;
    name: string;
    password: string;
    clients: Array<PartyClient>;
    banned_clients: Array<PartyClientID>;
    tracks_queue: Array<PartyTrack>;
    max_clients: number;
};

export type CredentialsInput = {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    created_at: string;
};

export type PartyTrack = {
    username: string;
    track_id: string;
    track_name: string;
};

export type PartyClient = {
    id: PartyClientID;
    username: string;
    privileges: number;
    is_connected: boolean;
};

export enum Privileges {
    User = 0,
    Moderator = 1,
    Owner = 2,
}

export type WsMessage = {
    type:
        | "lobby_data"
        | "spotify_data"
        | "user_connect"
        | "user_disconnect"
        | "search_result"
        | "add_to_queue"
        | "set_volume"
        | "play_resume"
        | "pause"
        | "seek_to_pos"
        | "kick_client"
        | "ban_client"
        | "kicked"
        | "banned"
        | "error";
    data: any;
};

export type SpotifyTrack = {
    track_id: string;
    track_name: string;
    artist_name: string;
};

export type SpotifyData = {
    recent_tracks: Array<SpotifyTrack>;
    playback_state:
        | ({
              device_id: string;
              device_volume: number;
              duration_ms: number;
              progress_ms: number;
              is_playing: boolean;
              shuffle: boolean;
              album_image_src: string;
          } & SpotifyTrack)
        | null;
    next_tracks: Array<SpotifyTrack>;
};

export type Nullable<T> = T | null;

export type CookieSession = (Session & { user_uuid: Nullable<string> }) | null;
