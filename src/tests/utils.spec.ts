import { describe, it, expect } from "vitest";

import { string_to_hex_uuid, hex_uuid_to_string, zip_iter, hex_uuid_to_valid_email, email_contains_invalid_chars } from "../lib/utils";

const LENGTH = 15;
const DUMMY_EMAILS = [
    "test@hotmail.com",
    "dummy-email@gmail.com",
    "invalid\\/email@wrong,;^$.chars",
    "smol@email.io",
    "i-lack_ideas_for-this-one@gmail.com",
];

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
        const length = DUMMY_EMAILS.reduce((i, email) => email.length > i ? email.length + 1 : i, 0);

        for (const email of DUMMY_EMAILS) {
            if (email_contains_invalid_chars(email)) continue;

            const hex = string_to_hex_uuid(email, length);

            const res = hex_uuid_to_valid_email(hex, email.length);

            // console.log(email, res);

            expect(res).toBe(email);
        }
    });
});
