import type { Device, UserProfile } from "@spotify/web-api-ts-sdk";

import type { Party, PartyClient } from "./types";

interface LocalStorage {
    spotify_tokens: SpotifyTokens | null;
    spotify_device: Device | null;
    spotify_profile: UserProfile | null;
    code_verifier: string | null;
    user: PartyClient | null;
    user_id: string | null;
    current_room: Party | null;
    // purple is default whatever prefers-color-scheme
    theme: "purple" | "neon" | "light" | "dark" | null; // null == window.matchMedia("(prefers-color-scheme: dark)").matches
}

export type SpotifyTokens = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    created_at: number;
};

type StorageType<T> = T extends keyof LocalStorage ? LocalStorage[T] : never;

/**
 * Can throw if localStorage and window.localStorage are not available
 */
export function set_storage_value(value: Partial<LocalStorage>) {
    if (!localStorage || !window.localStorage) throw new Error("Cannot access localStorage nor window.localStorage");
    const store = localStorage ?? window.localStorage;

    const storage = store.getItem("Sharify");

    if (storage == null) {
        store.setItem("Sharify", JSON.stringify(value));
        return;
    }

    const parsed_storage = JSON.parse(storage);

    store.setItem("Sharify", JSON.stringify({ ...parsed_storage, ...value }));

    return;
}

/**
 * Can throw if localStorage and window.localStorage are not available
 */
export function get_storage_value<T extends keyof LocalStorage, S extends StorageType<T>>(value: T) {
    if (!localStorage || !window.localStorage) throw new Error("Cannot access localStorage nor window.localStorage");
    const store = localStorage ?? window.localStorage;

    const store_object = JSON.parse(store.getItem("Sharify") || "{}") as LocalStorage;

    const returns = store_object[value] as S;

    return returns == ({} as S) ? null : returns;
}

export function string_to_hex_uuid(email: string, uuid_len: number) {
    if (email.trim() == "") return "";

    const hex_values = [];
    const split = email.split("");

    const [MIN_CHAR, MAX_CHAR] = ["-".charCodeAt(0), "z".charCodeAt(0)];
    const authorized_bytes = Array.from({ length: MAX_CHAR - MIN_CHAR + 1 }, (_, i) => MIN_CHAR + i);

    for (let i = 0; i < split.length; i += 1) {
        if ((i & 1) == 1 || i + 1 >= split.length) {
            continue;
        }

        const byte_one = split.at(i)?.charCodeAt(0);
        const byte_two = split.at(i + 1)?.charCodeAt(0);

        if (
            byte_one == undefined ||
            !authorized_bytes.includes(byte_one) ||
            byte_two == undefined ||
            !authorized_bytes.includes(byte_one)
        ) {
            continue;
        }

        hex_values.push(`${byte_one.toString(16).toUpperCase()}${byte_two.toString(16).toUpperCase()}`);
    }

    if (hex_values.length == 0) {
        return "";
    }

    let i = 0;
    while (hex_values.length != uuid_len) {
        if (hex_values.length < uuid_len) {
            hex_values.push(hex_values[i % hex_values.length]);
            i += 1;
        } else {
            hex_values.pop();
            i -= 1;
        }
    }

    return hex_values.join(":");
}

export function set_theme(theme: LocalStorage["theme"]) {
    document.documentElement.classList.remove(document.documentElement.className);

    switch (theme) {
        case "light":
        case "dark":
        case "neon":
            document.documentElement.classList.add(theme);
            set_storage_value({ theme });
            break;
        case "purple":
        case null:
        default: {
            set_storage_value({ theme: null });
            break;
        }
    }
}

export function get_theme() {
    return get_storage_value("theme");
}

export async function write_to_clipboard<T>(
    text: string,
    on_success: () => void | null,
    on_error: (error: T) => void | null,
) {
    let success = true;

    try {
        const type = "text/plain";
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await (navigator ?? window.navigator).clipboard.write(data);
        on_success?.();
    } catch (error) {
        success = false;
        on_error?.(error as T);
    }

    return success;
}

export function format_time(progress: number, duration: number) {
    const [p, m] = [new Date(progress), new Date(duration)];

    const format_number = (int: number) => {
        return int.toString().padStart(2, "0");
    };

    return `${format_number(p.getMinutes())}:${format_number(p.getSeconds())} / ${format_number(m.getMinutes())}:${format_number(m.getSeconds())}`;
}

/**
 * Custom zip iterator that takes two arrays to combine them on a tuple value and fills with null when one array is greater than the other
 */
export function zip_iter<T1, T2>(arr1: Array<T1>, arr2: Array<T2>) {
    const output: Array<[T1 | null, T2 | null]> = [];
    const min_len = Math.min(arr1.length, arr2.length);
    const max_len = Math.max(arr1.length, arr2.length);

    for (let i = 0; i < min_len; i += 1) {
        output.push([arr1[i], arr2[i]]);
    }

    for (let i = min_len; i < max_len; i += 1) {
        output.push([arr1[i] ?? null, arr2[i] ?? null]);
    }

    return output;
}

export function are_objects_equal(object1: object, object2: object) {
    const object_keys = Object.keys(object1);

    if (object_keys.length != Object.keys(object2).length) return false;

    for (const k of object_keys) {
        // @ts-expect-error JS is trash
        const v1 = object1[k];
        // @ts-expect-error JS is trash
        const v2 = object2[k];

        const are_objects = is_object(v1) && is_object(v2);

        if ((are_objects && !are_objects_equal(v1, v2)) || (!are_objects && v1 != v2)) {
            return false;
        }
    }
    return true;
}

function is_object(object: unknown) {
    return object != null && typeof object == "object";
}

export function click_link(e: MouseEvent | { currentTarget: HTMLButtonElement | HTMLDivElement }) {
    // @ts-expect-error This is a hack to make the button click the link
    e.currentTarget.children[0].click();
}
