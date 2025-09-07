import { redirect } from "@sveltejs/kit";
import * as uuid from "uuid";

import { PUBLIC_SERVER_ADDR_DEV } from "$env/static/public";
import { CommandResponse, HttpCommand } from "$lib/proto/cmd";
import type { PageServerLoad } from "./$types";
import { bytes_to_uuid_str } from "$/lib/utils";

export const load: PageServerLoad = async ({ url: { pathname } }) => {
	const pathname_split = pathname.split("/");

	if (pathname_split.length !== 4) {
		return redirect(300, "/");
	}

	const [room_id, password] = pathname_split.slice(2);

	if (!uuid.validate(room_id)) {
		return redirect(301, "/");
	}

	const command: HttpCommand = {
		getRoom: { roomId: uuid.parse(room_id) },
	};

	const bytes = HttpCommand.encode(command).finish();

	const res = await fetch(`${PUBLIC_SERVER_ADDR_DEV}/v1`, {
		method: "POST",
		headers: {
			"Content-Type": "application/protobuf",
		},
		body: bytes as BodyInit,
	});

	if (res.status !== 200 || res.body === null) {
		console.error(res);
		return redirect(301, "/");
	}

	const res_bytes = await res.bytes();

	try {
		const res_cmd = CommandResponse.decode(res_bytes);

		const room = res_cmd.room;

		if (room === undefined) {
			console.error(res_cmd);
			return redirect(301, "/");
		}

		if (room.password !== password) {
			console.error("Room password does not match", bytes_to_uuid_str(room.id), password);
			return redirect(301, "/");
		}

		return { room };
	} catch (e: unknown) {
		console.error(e);
		return redirect(301, "/");
	}
};
