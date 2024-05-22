export type PartyID = number;
export type PartyClientID = number;

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
