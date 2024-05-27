import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";
import client from "$/lib/server/apollo_client";
import { GET_PARTY } from "$/lib/queries";
import type { Party } from "$/lib/types";

export const load: PageServerLoad = async ({ url }) => {
	const { pathname } = url;
	const pathname_split = pathname.split("/");

	if (pathname_split.length != 4) {
		return redirect(300, "/");
	}

	const [party_id, password] = pathname_split.slice(2);

	const result = await client.query({ query: GET_PARTY, variables: { id: parseInt(party_id) } });

	if (result.error || (result.errors && result.errors.length > 0)) {
		console.error("Party doesn't exists", result.error, result.errors, party_id);
		return redirect(301, "/");
	}

	const party: Party | null = result.data?.getParty;

	if (party == null || party.password != password) {
		console.error("Party not found or password not right", result.data, party_id, password);
		return redirect(301, "/");
	}

	return { party };
};
