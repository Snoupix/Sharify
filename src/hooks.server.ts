import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { handle as authentication_handle } from "$lib/auth";

const protected_paths = ["/join", "/host"];

const authorization_handle: Handle = async ({ event, resolve }) => {
	if (
		event.url.pathname !== "/" &&
		protected_paths.find((path) => event.url.pathname.startsWith(path)) === undefined
	) {
		const session = await event.locals.auth();
		if (!session) {
			throw redirect(301, "/");
		}
	}

	return resolve(event);
};

export const handle = sequence(authentication_handle, authorization_handle);
