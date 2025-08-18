import { describe, it, expect } from "vitest";
import * as uuid from "uuid";

import {
	string_to_hex_uuid,
	hex_uuid_to_string,
	zip_iter,
	hex_uuid_to_valid_email,
	email_contains_invalid_chars,
    bytes_to_uuid_str,
} from "../lib/utils";

const LENGTH = 15;
const DUMMY_EMAILS = [
	"test@hotmail.com",
	"dummy-email@gmail.com",
	"invalid\\/email@wrong,;^$.chars",
	"smol@email.io",
	"i-lack_ideas_for-this-one@gmail.com",
	"i_am_bond_james_bond-007@mail.uk",
];
// v7 UUIDs
const DUMMY_UUID_STRS = [
	"0198bde2-02a3-715e-8ee5-f28f1fc1556a",
	"0198bde2-02a3-715e-8ee5-f6c14091ac3a",
	"0198bde2-02a3-715e-8ee5-f9f434d3cee7",
	"0198bde2-02a3-715e-8ee5-feda160a9b0d",
	"0198bddd-39fe-7492-8a6b-801c17751b62",
];
const DUMMY_UUID_BYTES = [new Uint8Array([1, 152, 189, 228, 221, 49, 120, 99, 179, 49, 252, 181, 241, 73, 127, 35])];

function are_emails_alike(a: string, b: string) {
	// eslint-disable-next-line
	for (const [i, [char1, char2]] of zip_iter(Array.from(a), Array.from(b)).entries()) {
		if (char1 === null || char2 === null) break;

		if (char1 !== char2) {
			// console.log("emails are not alike:");
			// console.log("  email1:", a);
			// console.log("  email2:", b);
			// console.log("  pos:", i);
			// console.log(`  ${char1} != ${char2}`);
			return false;
		}
	}

	return true;
}

describe("Email & HEX UUID conversions", () => {
	it("converts email to a valid HEX UUID", () => {
		const reg = new RegExp(`(:?(\\d|[A-F]){4}:?){${LENGTH}}`);

		for (const email of DUMMY_EMAILS) {
			const hex = string_to_hex_uuid(email, LENGTH);

			// console.log(reg.exec(hex));

			expect(hex).toMatch(reg);
		}
	});

	it("converts HEX UUID to string", () => {
		for (const email of DUMMY_EMAILS) {
			const hex = string_to_hex_uuid(email, LENGTH);

			// console.log(hex);

			const hex_in_str = hex_uuid_to_string(hex);

			// console.log(hex_in_str);

			if (email_contains_invalid_chars(email)) {
				expect(are_emails_alike(email, hex_in_str)).toBe(false);
				continue;
			}

			expect(are_emails_alike(email, hex_in_str)).toBe(true);
		}
	});

	it("converts HEX UUID to initial email", () => {
		const length = DUMMY_EMAILS.reduce((i, email) => (email.length > i ? email.length + 1 : i), 0);

		for (const email of DUMMY_EMAILS) {
			if (email_contains_invalid_chars(email)) continue;

			const hex = string_to_hex_uuid(email, length);

			const res = hex_uuid_to_valid_email(hex, email.length);

			// console.log(email, res);

			expect(res).toBe(email);
		}
	});
});

describe("Bytes & UUID / string conversions", () => {
	it("converts bytes to a valid UUID string", () => {
        for (const bytes of DUMMY_UUID_BYTES) {
            const str = bytes_to_uuid_str(bytes);

            expect(uuid.validate(str)).toBe(true);
        }
    });

    it("converts UUID string to bytes both ways", () => {
        for (const uuid_str of DUMMY_UUID_STRS) {
            expect(uuid.validate(uuid_str)).toBe(true);

            const bytes = uuid.parse(uuid_str);
            const str = bytes_to_uuid_str(bytes);

            expect(uuid.validate(str)).toBe(true);

            expect(uuid_str).toEqual(str);
        }
    });
});
