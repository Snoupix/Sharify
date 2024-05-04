import { useEffect, useState } from "react";

interface LocalStorage {
    st: SpotifyTokensStorage | null
    SpotifyDevice: string
    code_verifier: string
}

export interface SpotifyTokensStorage {
    at: string
    rt: string
    ein: number
    date: number
}

type StorageType<T> = T extends keyof LocalStorage ? LocalStorage[T] : never;

/**
 * Can throw if localStorage and window.localStorage are not available
 */
export const SetStorageValue = (value: Partial<LocalStorage>): void => {
	if (!localStorage || !window.localStorage) throw new Error("Cannot access localStorage nor window.localStorage");
    const store = localStorage ?? window.localStorage;

    const storage = store.getItem('Sharify');

    if (storage == null) {
        store.setItem('Sharify', JSON.stringify(value));
        return;
    }

    const parsed_storage = JSON.parse(storage);

    store.setItem('Sharify', JSON.stringify({ ...parsed_storage, ...value }));

    return;
}

/**
 * Can throw if localStorage and window.localStorage are not available
 */
export function GetStorageValue<T extends keyof LocalStorage>(value: T): StorageType<T> | null {
	if (!localStorage || !window.localStorage) return {} as StorageType<T>; //throw new Error("Cannot access localStorage nor window.localStorage");
    const store = localStorage ?? window.localStorage;

	const store_object = JSON.parse(store.getItem('Sharify') || "{}") as LocalStorage;

	const returns = store_object[value] as StorageType<T>;

    return returns == {} as StorageType<T> ? null : returns;
}

export function useDebounce(value: any, delay: number = 500) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}

export function FormatTime(progress: number, duration: number) {
    const [p, m] = [new Date(progress), new Date(duration)];

    const FormatNumber = (int: number): string => {
        return int.toString().padStart(2, '0');
    }

    return `${FormatNumber(p.getMinutes())}:${FormatNumber(p.getSeconds())} / ${FormatNumber(m.getMinutes())}:${FormatNumber(m.getSeconds())}`;
}
