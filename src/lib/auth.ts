import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/sveltekit/providers/github";
import Google from "@auth/sveltekit/providers/google";
import Discord from "@auth/sveltekit/providers/discord";
import Spotify from "@auth/sveltekit/providers/spotify";
import Twitch from "@auth/sveltekit/providers/twitch";

import { string_to_hex_uuid } from "./utils";

const USER_ID_LEN = 10;

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [GitHub, Google, Discord, Spotify, Twitch],
    callbacks: {
        async session({ session: s }) {
            const session: typeof s & { user_uuid: string | null } = { user_uuid: null, ...s };
            const email = session.user.email;

            if (session.user_uuid == null && email != null && email.trim() != "") {
                session.user_uuid = string_to_hex_uuid(email, USER_ID_LEN);
            }

            return session;
        },
    },
});
