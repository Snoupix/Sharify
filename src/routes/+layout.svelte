<script lang="ts">
    import { onMount, setContext } from "svelte";
    import { afterNavigate, goto } from "$app/navigation";
    import { Toaster, toast, type ToasterProps } from 'svelte-sonner';

    import Spotify from "$/lib/spotify";
    import { room_data, spotify_data } from "$/lib/ws_impl";
    import { bytes_to_uuid_str, get_storage_value, set_storage_value, set_theme } from "$/lib/utils";
    import Navbar from "$/components/navbar.svelte";
    import type { Nullable } from "$/lib/types";
    import type { LayoutProps } from "./$types";

    import "$/app.css";

    const toaster_props: ToasterProps = {
        closeButton: true,
        position: "top-center",
    };

    const dont_redirect_on_paths = [/\/room*/];
    const unauthorized_paths = [/\/host*/, /\/join*/];

    setContext("RoomData", room_data);
    setContext("SpotifyData", spotify_data);

    const { data, children }: LayoutProps = $props();
    const session = data.session;

    let user_id: Nullable<string> = $state(null);

    onMount(() => {
        set_theme(get_storage_value("theme") ?? "purple");

        $Spotify?.SetTokens();
    });

    afterNavigate(async navigate => {
        if (session?.user_uuid) {
            user_id = session.user_uuid;
            set_storage_value({ user_id });
        } else {
            set_storage_value({ user_id: null });
        }

        if (session == null && unauthorized_paths.find(r => navigate.to?.url.pathname.match(r))) {
            toast("You need to be connected to do that, please log in first");
            return await goto("/");
        }

        // This avoids the redirects and cleans the cache on server redirect
        if (navigate.to?.route?.id == "/" && navigate.type == "goto") {
            set_storage_value({ current_room: null, user: null });

            return;
        }

        // This triggers on every route changes so I have to filter it to deny checks when already in a room for example
        if (dont_redirect_on_paths.find(r => navigate.to?.url.pathname.match(r)) != undefined) {
            console.log("path", navigate.to?.url.pathname, "is in", dont_redirect_on_paths);
            return;
        }
        const room = get_storage_value("current_room");
        if (room == null) return;

        const user = get_storage_value("user");
        if (user == null) return set_storage_value({ current_room: null });

        const room_user = room.users.find(u => u.id == user.id);
        if (!room_user) return set_storage_value({ current_room: null, user: null });

        console.log(room)

        await goto(`/room/${bytes_to_uuid_str(room.id)}`);
    });
</script>

<main>
    <Navbar {session} />
    {@render children?.()}
    <Toaster {...toaster_props} />
</main>

<style lang="postcss">
    @reference "$/app.css";

    :global(:root) {
        /* TODO: Delete */
        --toastify-font-family: "Montserrat", sans-serif;
        --toastify-color-progress-light: linear-gradient(
            to right,
            var(--color-bg),
            var(--color-main)
        );
        --toastContainerTop: 2vh;
        --toastContainerRight: auto;
        --toastContainerLeft: .5vw;

        --toastBorderRadius: 0.5rem;
        --toastWidth: 25vw;
        --toastPadding: 0.25rem 1.25rem;
        --toastColor: var(--color-neutral-200);
        --toastBackground: var(--color-purple-400);
        --toastBarBackground: var(--color-purple-200);
    }

    :global(._toastContainer) {
        border: 1px solid black;
        border-radius: 5rem;
    }

    :global(html) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :global(*) {
        color: var(--color-main);
        font-family: var(--font-montserrat);
    }

    main {
        @apply relative h-screen w-screen bg-bg;
    }
</style>
