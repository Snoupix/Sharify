import { useEffect, useState } from "react"

export interface SpotifyTokensStorage {
    at: string
    rt: string
    ein: number
    date: number
}

interface LocalStorage {
    st: SpotifyTokensStorage | null
    SpotifyDevice: string
}

type LocalStorageValues = "st" | "SpotifyDevice"

type StorageType<T> =
    T extends "st" ? SpotifyTokensStorage :
    T extends "SpotifyDevice" ? string :
    never;

export const SetStorageValue = (value: Partial<LocalStorage>): Partial<LocalStorage> => {
	if (!localStorage) return SetStorageValue(value);

    const Storage = localStorage.getItem('Sharify');

    if (Storage == null) {
        localStorage.setItem('Sharify', JSON.stringify(value));
        return value;
    }

    const ParsedStorage = JSON.parse(Storage);

    localStorage.setItem('Sharify', JSON.stringify({ ...ParsedStorage, ...value }));

    return value;
}

export function GetStorageValue<T extends LocalStorageValues>(value: T): StorageType<T> | null {
	if (!localStorage) return null;

    const storageObject = JSON.parse(localStorage.getItem('Sharify') || '{}') as LocalStorage;

	return storageObject[value] as StorageType<T>;
}


export const useDebounce = (value: any, delay: number = 500) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}

export const FormatTime = (progress: number, duration: number) => {
    const [p, m] = [new Date(progress), new Date(duration)];

    const FormatNumber = (int: number): string => {
        if (int < 10) {
            return `0${int}`;
        }
    
        return `${int}`;
    }

    return `${FormatNumber(p.getMinutes())}:${FormatNumber(p.getSeconds())} / ${FormatNumber(m.getMinutes())}:${FormatNumber(m.getSeconds())}`;
}
