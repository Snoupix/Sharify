import { redirect } from "@sveltejs/kit";
import * as uuid from "uuid";

import { PUBLIC_SERVER_ADDR_DEV } from "$env/static/public";
import { CommandResponse, HttpCommand } from "$/lib/proto/cmd";
import type { PageServerLoad } from "./$types";
import type { CookieSession } from "$/lib/types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const room_id = params.slug;
	const session = (await locals.auth()) as CookieSession;

	if (session == null) {
		return redirect(300, "/");
	}

	const user_id = session.user_uuid;

	if (user_id == null || !uuid.validate(room_id)) {
		return redirect(300, "/");
	}

	const command: HttpCommand = { getRoom: { roomId: uuid.parse(room_id) } };

	const bytes = HttpCommand.encode(command).finish();

	let res;
	try {
		res = await fetch(`${PUBLIC_SERVER_ADDR_DEV}/v1`, {
			method: "POST",
			headers: {
				"Content-Type": "application/protobuf",
			},
			body: bytes as BodyInit,
		});
	} catch (e: unknown) {
		console.error("Unreachable API", e);
		return redirect(307, "/");
	}

	if (res.status === 404) {
		console.error("Room doesn't exists anymore", room_id, await res.text());
		return redirect(307, "/");
	}

	if (res.status !== 200 || res.body === null) {
		console.error(res);
		return redirect(307, "/");
	}

	const res_bytes = await res.bytes();

	try {
		const res_cmd = CommandResponse.decode(res_bytes);

		if (res_cmd.room === undefined) {
			console.error(`An error occured while creating the room. ${res_cmd.genericError}`);
			return redirect(307, "/");
		}

		if (res_cmd.room.users.find((u) => u.id === user_id) === undefined) {
			console.error("RoomUser isn't in room anymore", res_cmd.room, room_id, user_id);
			return redirect(307, "/");
		}
	} catch (e: unknown) {
		console.error(e);
		return redirect(307, "/");
	}
};
