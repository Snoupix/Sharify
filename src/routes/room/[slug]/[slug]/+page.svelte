<script lang="ts">
    import websocket from "websocket";
    import { getContext, hasContext, onDestroy, onMount } from "svelte";
	import { page } from "$app/stores";
    import type { Writable } from "svelte/store";
    import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

    import ws, { init_ws } from "$/lib/ws_store";
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";

    if (!hasContext("GQL_Client")) {
        throw new Error("Unexpected error: Unable to get GraphQL client on context, please contact Snoupix");
    }

    if (!hasContext("RoomData")) {
        throw new Error("Unexpected error: Unable to get room data context, please contact Snoupix");
    }

    const room_data: Writable<any> = getContext("RoomData");
    const client: Writable<ApolloClient<NormalizedCacheObject> | null> = getContext("GQL_Client");

    if ($client == null) {
        throw new Error("Unexpected error: Unable to initiate GraphQL client, please contact Snoupix");
    }

    onMount(() => {
        const pathname_split = $page.url.pathname.split('/');

        if (pathname_split.length != 4) {
            toast.push("Unexpected error: Bad pathname", { duration: 2500 });
            setTimeout(() => goto("/"), 2500);
        }

        const [room_id, client_id] = pathname_split.slice(2).map(n => parseInt(n));

        init_ws(room_id, client_id, undefined, undefined, on_ws_error, on_ws_message);
    });

    onDestroy(() => $ws?.close());

    function on_ws_message(message: websocket.IMessageEvent) {
        if (typeof message.data != "string") {
            return;
        }

        const data = JSON.parse(message.data);

        switch (data.type) {
            case "lobby_data":
                $room_data = data.data;
                console.log($room_data);
                break;
            default:
                console.error("Unhandled case on WS message. Data: ", data);
        }
    }

    function on_ws_error(e: Error) {
        console.error("Unable to connect to server WebSocket, redirecting...", e);
        goto("/");
    }
</script>
