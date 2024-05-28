import type { Device, UserProfile } from "@spotify/web-api-ts-sdk";

import type { Party, PartyClient } from "./types";

interface LocalStorage {
    st: SpotifyTokensStorage | null;
    SpotifyDevice: Device | null;
    SpotifyProfile: UserProfile | null;
    code_verifier: string | null;
    user: PartyClient | null;
    current_room: Party | null;
}

export interface SpotifyTokensStorage {
    at: string;
    rt: string;
    ein: number;
    date: number;
}

type StorageType<T> = T extends keyof LocalStorage ? LocalStorage[T] : never;

/**
 * Can throw if localStorage and window.localStorage are not available
 */
export const SetStorageValue = (value: Partial<LocalStorage>): void => {
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
};

/**
 * Can throw if localStorage and window.localStorage are not available
 */
export function GetStorageValue<T extends keyof LocalStorage, S extends StorageType<T>>(value: T): S | null {
    if (!localStorage || !window.localStorage) throw new Error("Cannot access localStorage nor window.localStorage");
    const store = localStorage ?? window.localStorage;

    const store_object = JSON.parse(store.getItem("Sharify") || "{}") as LocalStorage;

    const returns = store_object[value] as S;

    return returns == ({} as S) ? null : returns;
}

export async function WriteToClipboard(
    text: string,
    on_success: () => void | null,
    on_error: (error: any) => void | null,
): Promise<boolean> {
    let success = true;

    try {
        const type = "text/plain";
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await (navigator ?? window.navigator).clipboard.write(data);
        on_success != null && on_success();
    } catch (error: any) {
        success = false;
        on_error != null && on_error(error);
    }

    return success;
}

export function FormatTime(progress: number, duration: number) {
    const [p, m] = [new Date(progress), new Date(duration)];

    const FormatNumber = (int: number): string => {
        return int.toString().padStart(2, "0");
    };

    return `${FormatNumber(p.getMinutes())}:${FormatNumber(p.getSeconds())} / ${FormatNumber(m.getMinutes())}:${FormatNumber(m.getSeconds())}`;
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

export function click_link(e: MouseEvent | { currentTarget: HTMLButtonElement | HTMLDivElement }) {
    // @ts-expect-error This is a hack to make the button click the link
    e.currentTarget.children[0].click();
}
