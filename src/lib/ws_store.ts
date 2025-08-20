import websocket from "websocket";
import { writable, type Writable } from "svelte/store";
import { env } from "$env/dynamic/public";

import { bytes_to_uuid_str } from "./utils";
import type { Room } from "$/lib/proto/room";
import type { Nullable } from "./types";

export const ws: Writable<Nullable<websocket.w3cwebsocket>> = writable(null);

function default_onopen() {
    console.log("WS connected");
}

function default_onclose(close_event: websocket.ICloseEvent) {
    console.log(`WS closed (${JSON.stringify(close_event)})`);
}

function default_onerror(error: Error) {
    console.log("WS error", error);
}

function default_onmessage(message: websocket.IMessageEvent) {
    console.log("WS message", message);
}

export function init_ws(
    room_id: Room["id"],
    user_id: Room["users"][number]["id"],
    onopen: typeof default_onopen = default_onopen,
    onclose: typeof default_onclose = default_onclose,
    onerror: typeof default_onerror = default_onerror,
    onmessage: typeof default_onmessage = default_onmessage,
) {
    const ws_instance = new websocket.w3cwebsocket(
        `${env.PUBLIC_SERVER_ADDR_DEV}/v1/${bytes_to_uuid_str(room_id)}/${user_id}`, // TODO prod: Change me
        undefined,
        undefined,
        undefined,
        undefined,
        { closeTimeout: 10000 },
    );

    ws_instance.onopen = () => {
        ws.update((instance) => {
            if (instance !== null) {
                instance.close();
            }

            return ws_instance;
        });

        onopen();
    };

    ws_instance.onclose = onclose;

    ws_instance.onerror = onerror;

    ws_instance.onmessage = onmessage;
}
