import { goto } from "$app/navigation";
import type { Device, UserProfile } from "@spotify/web-api-ts-sdk";

import type { Room, RoomUser } from "$lib/proto/room";
import type { Nullable } from "$lib/types";
import type { Role } from "$lib/proto/role";

// TODO Change $/lib to $lib everywhere

export interface LocalStorage {
	spotify_tokens: SpotifyTokens | null;
	spotify_device: Device | null;
	spotify_profile: UserProfile | null;
	code_verifier: string | null;
	user: RoomUser | null;
	user_id: string | null;
	current_room: Room | null;
	// purple is default whatever prefers-color-scheme
	theme: Nullable<typeof themes[number]>; // null == window.matchMedia("(prefers-color-scheme: dark)").matches
}

export type SpotifyTokens = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	created_at: number;
};

type StorageType<T> = T extends keyof LocalStorage ? LocalStorage[T] : never;

export const themes = ["purple", "neon", "light", "dark"] as const;

const ZERO_CHAR = "0".charCodeAt(0);
const [MIN_CHAR, MAX_CHAR] = ["-".charCodeAt(0), "z".charCodeAt(0)];
const AUTHORIZED_BYTES = [ZERO_CHAR, ...Array.from({ length: MAX_CHAR - MIN_CHAR + 1 }, (_, i) => MIN_CHAR + i)];

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

	for (let i = 0; i < split.length; i += 1) {
		// Allows the last char to be handled even
		// if the index is odd, the left byte will be a 0
		// so the email can be recontructed from the UUID
		if ((i & 1) == 1 && i !== split.length - 1) {
			continue;
		}

		const byte_one = split.at(i)?.charCodeAt(0) ?? ZERO_CHAR;
		const byte_two = split.at(i + 1)?.charCodeAt(0) ?? ZERO_CHAR;

		if (!AUTHORIZED_BYTES.includes(byte_one) || !AUTHORIZED_BYTES.includes(byte_two)) {
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

export function hex_uuid_to_string(hex: string) {
	return hex.split(":").reduce((res, byte) => {
		const b1 = parseInt(byte.slice(0, 2), 16);
		const b2 = parseInt(byte.slice(2, 4), 16);

		res += String.fromCharCode(b1);
		res += String.fromCharCode(b2);
		return res;
	}, "");
}

export function email_contains_invalid_chars(email: string) {
	return email
		.split("")
		.map((b) => !AUTHORIZED_BYTES.includes(b.charCodeAt(0)))
		.some(Boolean);
}

export function hex_uuid_to_valid_email(hex: string, email_length: number) {
	// HEX UUID is too small to contain the email
	if (hex.replaceAll(/[^:]/g, "").length < email_length) return null;

	const str = hex_uuid_to_string(hex);
	if (str.length === email_length) return str;

	return str.slice(0, email_length);
}

export function bytes_to_uuid_str(bytes: Uint8Array<ArrayBufferLike>) {
	const dashless_uuid_str = Array.from(bytes)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	const parts = [
		dashless_uuid_str.slice(0, 8),
		dashless_uuid_str.slice(8, 12),
		dashless_uuid_str.slice(12, 16),
		dashless_uuid_str.slice(16, 20),
		dashless_uuid_str.slice(20),
	];

	return parts.join("-");
}

/// Most likely used to make UUIDs (RoleID, RoomID...) unique and compare them
export function sum_bytes(arr: Uint8Array<ArrayBufferLike>) {
    return arr.reduce((acc, byte) => acc + byte, 0);
}

export function get_user_role(room_data: Nullable<Room>, user_role_id: RoomUser["roleId"]): Nullable<Role> {
    if (!user_role_id) return null;

    return room_data?.roleManager?.roles.find((r) => {
        if (typeof r.id?.reduce !== "function" || typeof user_role_id?.reduce !== "function") {
            return false;
        }

        return sum_bytes(r.id) === sum_bytes(user_role_id);
    }) ?? null;
}

export function set_theme(theme: LocalStorage["theme"]) {
	const class_name = document.documentElement.className;
	if (class_name.trim().length != 0) {
		document.documentElement.classList.remove(class_name);
	}

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

export function custom_promise() {
    let resolve_ptr: (_: unknown) => void;
    let reject_ptr: (reason: string) => void;

    const promise = new Promise((res, rej) => {
        resolve_ptr = res;
        reject_ptr = rej;
    });

    // @ts-expect-error This is not beautiful, I know
    return { promise, resolve_ptr, reject_ptr };
}

export function with_timeout<T>(promise: Promise<T>, timeout_error: string, ms: number) {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(timeout_error), ms));

    return Promise.race([promise, timeout]);
}

export async function leave_room() {
    set_storage_value({ current_room: null, user: null });
    await goto("/");
}
