import type { LayoutServerLoad } from "./$types";
import type { CookieSession } from "$/lib/types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const session = (await locals.auth()) as CookieSession;

    return { session };
};
