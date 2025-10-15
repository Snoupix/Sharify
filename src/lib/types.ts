import type { Session } from "@auth/sveltekit";

import type { PlaybackState, Track } from "$lib/proto/spotify";

export type SpotifyData = {
	recent_tracks: Array<Track>;
	playback_state: PlaybackState | null;
	next_tracks: Array<Track>;
};

export type Nullable<T> = T | null;

export type CookieSession = (Session & { user_uuid: Nullable<string> }) | null;
