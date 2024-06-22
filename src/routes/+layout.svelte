<script lang="ts">
    import { onMount, setContext } from "svelte";
    import { afterNavigate, goto } from "$app/navigation";
    import { writable } from "svelte/store";
    import { env } from "$env/dynamic/public";
    import { ApolloClient, InMemoryCache, type NormalizedCacheObject } from "@apollo/client/core";
    import { SvelteToast, toast } from "@zerodevx/svelte-toast";
    import colors from "tailwindcss/colors";

    import Spotify from "$/lib/spotify";
    import { get_storage_value, set_storage_value } from "$/lib/utils";
    import Navbar from "$/components/navbar.svelte";
    import type { Party, SpotifyData, Nullable } from "$/lib/types";
    import type { LayoutData } from "./$types";

    import "$/style.css";

    const dont_redirect_on_paths = [/\/room*/];
    const unauthorized_paths = [/\/host*/, /\/join*/];

    // https://github.com/zerodevx/svelte-toast?tab=readme-ov-file#toast-options
    const toast_default_options = {
        pausable: true,
        dismissable: true,
        duration: 5000,
        theme: {
            "--toastContainerTop": "auto",
            "--toastContainerBottom": "1.5rem",
            "--toastBorderRadius": "0.25rem",
            "--toastWidth": "18rem",
            "--toastPadding": "0.25rem 1.25rem",
            "--toastColor": colors.neutral[200],
            "--toastBackground": colors.purple[400],
            "--toastBarBackground": colors.purple[200],
        },
    };

    const apollo_store = writable<ApolloClient<NormalizedCacheObject> | null>();
    apollo_store.update(client => {
        if (client != null) return client;

        return new ApolloClient({
            cache: new InMemoryCache(),
            uri: `${env.PUBLIC_SERVER_ADDR_DEV}/sharify`, // TODO: Handle public addr on prod
            name: "sharify-apollo-web-client",
            queryDeduplication: true, // TODO: Be carefull using that, it may break my gql logic sv side
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: "cache-and-network",
                },
                query: {
                    errorPolicy: "all",
                },
                mutate: {
                    errorPolicy: "all",
                },
            },
        });
    });
    setContext("GQL_Client", apollo_store);

    const room_data_store = writable<Party | null>(null);
    setContext("RoomData", room_data_store);

    const spotify_data_store = writable<SpotifyData | null>(null);
    setContext("SpotifyData", spotify_data_store);

    export let data: LayoutData;
    const session = data.session;
    let user_id: Nullable<string> = null;

    onMount(() => {
        // TDD As they say
        /* const x = (i: string) => {
            return i.split(':').reduce((res, str) => {
                let b1 = parseInt(str.slice(0, 2), 16);
                let b2 = parseInt(str.slice(2, 4), 16);

                res += String.fromCharCode(b1);
                res += String.fromCharCode(b2);
                return res;
            }, "");
        };
        const a = string_to_hex_uuid("test@hotmail.fr", 10);
        const b = string_to_hex_uuid("thisistestdrivendev@gmail.com", 10);
        console.log(a, x(a));
        console.log(b, x(b)); */

        (() => {
            const tokens = get_storage_value("spotify_tokens");
            if ($Spotify == null || $Spotify.is_ready || tokens == null) return;

            $Spotify.ProcessTokens(tokens);
        })();
        (() => {
            const theme = get_storage_value("theme");
            if (
                (theme != null && theme == "dark") ||
                (theme == null && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        })();
    });

    afterNavigate(async navigate => {
        (() => {
            if (session?.user_uuid) {
                user_id = session.user_uuid;
                set_storage_value({ user_id });
            } else {
                set_storage_value({ user_id: null });
            }
        })();

        if (session == null && unauthorized_paths.find(r => navigate.to?.url.pathname.match(r))) {
            toast.push("You need to be connected to do that, please log in first");
            return await goto("/");
        }

        // This avoids the redirects and cleans the cache on server redirect
        if (navigate.to && navigate.to.route.id == "/" && navigate.type == "goto") {
            set_storage_value({ current_room: null, user: null });

            return;
        }

        // This triggers on every route changes so I have to filter it to deny checks when already in a room for example
        if (dont_redirect_on_paths.find(r => navigate.to?.url.pathname.match(r)) != undefined) {
            console.log("path", navigate.to?.url.pathname, "is in", dont_redirect_on_paths);
            return;
        }
        const party = get_storage_value("current_room");
        if (party == null) return;

        const client = get_storage_value("user");
        if (client == null) return set_storage_value({ current_room: null });

        const client_id = party.clients.find(c => c.id == client.id);
        if (!client_id) return set_storage_value({ current_room: null, user: null });

        await goto(`/room/${party.id}`);
    });
</script>

<main>
    <Navbar {session} />
    <slot />
    <SvelteToast options={toast_default_options} />
</main>

<style lang="postcss">
    :global(:root) {
        /* TODO: Delete */
        --toastify-font-family: "Montserrat", sans-serif;
        --toastify-color-progress-light: linear-gradient(
            to right,
            theme("colors.bg-color"),
            theme("colors.main-color")
        );
    }

    :global(html) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :global(*) {
        color: theme("colors.main-color");
        font-family: theme("fontFamily.montserrat");
    }

    main {
        @apply relative min-h-screen w-screen bg-bg-color;
    }
</style>
