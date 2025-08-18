import websocket from "websocket";
import { type Writable, writable } from "svelte/store";
import { env } from "$env/dynamic/public";

import type { Room } from "$/lib/proto/room";
import { bytes_to_uuid_str } from "./utils";

const ws: Writable<websocket.w3cwebsocket | null> = writable(null);

function default_onopen() {
    console.log("WS connected");
}

function default_onclose() {
    console.log("WS closed");
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
    const _ws = new websocket.w3cwebsocket(
        `${env.PUBLIC_SERVER_ADDR_DEV}/v1/${bytes_to_uuid_str(room_id)}/${user_id}`, // TODO prod: Change me
        undefined,
        undefined,
        undefined,
        undefined,
        { closeTimeout: 10000 },
    );

    _ws.onopen = onopen;

    _ws.onclose = onclose;

    _ws.onerror = onerror;

    _ws.onmessage = onmessage;

    ws.set(_ws);
}

export default ws;
