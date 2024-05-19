<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { afterNavigate, goto } from "$app/navigation";
	import { writable } from "svelte/store";
    import { env } from "$env/dynamic/public";
    import { ApolloClient, InMemoryCache, type NormalizedCacheObject } from "@apollo/client/core";
	import { SvelteToast } from "@zerodevx/svelte-toast";
    import colors from "tailwindcss/colors";

    import Spotify from "$/lib/spotify";
	import { GetStorageValue, SetStorageValue } from "$/lib/utils";
	import Navbar from "$/components/navbar.svelte";

	import "$/style.css";

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
    apollo_store.update(x => {
        if (x != null) return x;

        return new ApolloClient({
            cache: new InMemoryCache(),
            uri: `${env.PUBLIC_LOCAL_SERVER_ADDR}/sharify`, // TODO: Handle public addr on prod
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
                }
            },
        });
    });
    setContext("GQL_Client", apollo_store);

    const room_data_store = writable<any>();
    setContext("RoomData", room_data_store);

    onMount(() => {
        const tokens = GetStorageValue("st");
        if (($Spotify == null || !$Spotify.is_ready) || tokens == null) return;

        $Spotify.ProcessTokens({
            access_token: tokens.at,
            refresh_token: tokens.rt,
            expires_in: tokens.ein,
            created_at: tokens.date,
        });
    });

    afterNavigate(() => {
        const party = GetStorageValue("current_room");
        if (party == null) return;

        const client = GetStorageValue("user");
        if (client == null) return SetStorageValue({ current_room: null });

        const client_id = party.clients.find(c => c.id == client.id);
        if (!client_id) return SetStorageValue({ current_room: null, user: null });

        goto(`/room/${party.id}/${client_id.id}`);
    });
</script>

<main>
	<Navbar />
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
		@apply relative min-h-screen w-screen bg-[#24004C];
	}
</style>
