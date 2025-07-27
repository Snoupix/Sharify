import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";
import client from "$/lib/server/apollo_client";
import { GET_PARTY } from "$/lib/queries";
import type { CookieSession, Party } from "$/lib/types";

export const load: PageServerLoad = async ({ params, locals }) => {
    const party_id = params.slug;
    const session = (await locals.auth()) as CookieSession;

    if (session == null) {
        return redirect(300, "/");
    }

    const client_id = session.user_uuid;

    if (client_id == null) {
        return redirect(300, "/");
    }

    const result = await client.query({ query: GET_PARTY, variables: { id: parseInt(party_id) } });

    if (result.error || (result.errors && result.errors.length > 0)) {
        console.error("Party doesn't exists anymore", result.error, result.errors, party_id);
        return redirect(301, "/");
    }

    const party: Party | null = result.data?.getParty;

    if (party == null || party.clients.find(c => c.id == client_id) == undefined) {
        console.error("Client isn't in party anymore", result.data, party_id, client_id);
        return redirect(301, "/");
    }
};
