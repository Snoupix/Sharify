import dotenv from 'dotenv';
import { createCookieSessionStorage, redirect } from "@remix-run/node";

dotenv.config();

type SessionProperty =  "username" | "SpotifyTokens";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "Sharify_session",
        // normally you want this to be `secure: true`
        // but that doesn't work on localhost for Safari
        // https://web.dev/when-to-use-local-https/
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getSessionData(
    request: Request,
    property: SessionProperty
) {
    const session = await getUserSession(request);
    const data = session.get(property);

    if (!data || typeof data != "string") return null;

    return data;
}

export async function setSessionData(
    request: Request,
    property: SessionProperty,
    data: string,
    redirectTo: string
) {
    const session = await getUserSession(request);

    session.set(property, data);

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function unsetSessionData(
    request: Request,
    property: string,
    redirectTo: string
) {
    const session = await getUserSession(request);

    session.unset(property);

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function createUserSession(redirectTo: string) {
    const session = await storage.getSession();

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function destroyUserSession(request: Request, redirectTo: string) {
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.destroySession(await getUserSession(request)),
        },
    });
}
