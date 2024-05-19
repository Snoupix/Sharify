import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";
import client from "$/lib/server/apollo_client";
import { GET_PARTY } from "$/lib/queries";
import type { Party } from "$/lib/types";

export const load: PageServerLoad = async ({ url }) => {
    const { pathname } = url;
    const pathname_split = pathname.split('/');
    
    if (pathname_split.length != 4) {
        return redirect(300, "/");
    }

    const [party_id, client_id] = pathname_split.slice(2);

    const result = await client.query({ query: GET_PARTY, variables: { id: parseInt(party_id) } });

    if (result.error || (result.errors && result.errors.length > 0)) {
        console.error("Party doesn't exists anymore", result.error, result.errors, party_id);
        return redirect(300, "/");
    }

    const party: Party = result.data?.getParty;

    if (party.clients.find(c => c.id == parseInt(client_id)) == undefined) {
        console.error("Client isn't in party anymore", result.data, party_id, client_id);
        return redirect(300, "/");
    }
};
