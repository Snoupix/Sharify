import { get, writable } from "svelte/store";
import { type Writable } from "svelte/store";

import { ws } from "$lib/ws_store";
import { Command } from "$lib/proto/cmd";
import { get_storage_value, leave_room } from "$lib/utils";
import type { Nullable, SpotifyData } from "$/lib/types";
import type { Room } from "$/lib/proto/room";

// Initiated here, added to Context on layout.svelte and retrieved with getContext
export const room_data: Writable<Nullable<Room>> = writable(null);
export const spotify_data: Writable<Nullable<SpotifyData>> = writable(null);

export async function send_ws_command(command: Command, on_error_cb = async () => {}) {
	const socket = get(ws);

	if (socket === null) {
		return await on_error_cb();
	}

	console.log(`[DEBUG WS] Sending "${Object.keys(command).filter((k) => !!k)[0]}" Command`);

	const bytes = Command.encode(command).finish();

	socket.send(bytes);
}

export async function leave_room_cmd(on_error_cb = async () => {}) {
	const { room_id, user_id } = {
		room_id: get_storage_value("current_room")?.id ?? null,
		user_id: get_storage_value("user_id"),
	};
	if (room_id !== null && user_id !== null) {
		send_ws_command({ leaveRoom: false }, on_error_cb);
	}

	await leave_room();
}
