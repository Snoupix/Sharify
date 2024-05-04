import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useOutletContext, useSubmit } from "@remix-run/react";

import Title from "~/components/title";
import { getSessionData, setSessionData } from "~/server/session.server";
import type { OutletContext } from "~/root";

type LoaderData = {
    SpotifyTokens: {
        sat: string
        srt: string
        ein: number
        date: number
    }
}

export const action: ActionFunction = async ({
    request
}) => {
    const formData = await request.formData();
    const sTokens = formData.get("spotifyTokens") as string;

    return await setSessionData(request, "SpotifyTokens", sTokens, "/host");
}

export const loader: LoaderFunction = async ({
    request
}) => {
    const SpotifyTokens = await getSessionData(request, "SpotifyTokens");

    if (SpotifyTokens) {
        return json({ SpotifyTokens: JSON.parse(SpotifyTokens) });
    }

    return null;
}

export default function Auth_Spotify() {
    const loaderData = useLoaderData<LoaderData>();
    const { spotify } = useOutletContext<OutletContext>();
    const submit = useSubmit();
	const [text, setText] = useState("");
    const [fetched, setFetched] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (spotify == null) return;

        const interval = setInterval(() => {
            if (spotify.is_ready) {
                setIsReady(true);
                clearInterval(interval);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [spotify])

    useEffect(() => {
        if (fetched || spotify == null) return;

        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (code) {
            setFetched(true);
            return spotify.FetchAccessToken(code);
        }

        if (error) {
            setFetched(true);
            return setText(`Error: ${error}`);
        }

        if (loaderData && loaderData.SpotifyTokens) {
            const expires_in = (
                loaderData.SpotifyTokens.ein > 0 && loaderData.SpotifyTokens.ein <= 3600
                    ? loaderData.SpotifyTokens.ein
                    : 3600
            ) * 1000;
            const msDiff = (loaderData.SpotifyTokens.date + expires_in) - Date.now();

            if (msDiff > 0) {
                setFetched(true);
                return spotify.ProcessTokens({
                    access_token: loaderData.SpotifyTokens.sat,
                    refresh_token: loaderData.SpotifyTokens.srt,
                    expires_in: loaderData.SpotifyTokens.ein,
                    created_at: loaderData.SpotifyTokens.date
                });
            }
        }

        (async () => {
            const url = await spotify.GenerateAuthLink();

            if (url instanceof Error) {
                console.error(error);
                setText(`Error: ${error}`);
                return;
            }

            location.replace(url);
        })()
    }, [loaderData, fetched, spotify])

    useEffect(() => {
        if (isReady) {
            (async () => {
                setFetched(true);

                const profile = await spotify.GetProfile();

                if (!(profile instanceof Error)) {
                    setText(`Successfully connected to ${profile.display_name}`);
                }
                
                const tokens = spotify.GetTokens();
    
                setTimeout(() => {
                    submit(
                        {
                            spotifyTokens: JSON.stringify({
                                sat: tokens.accessToken,
                                srt: tokens.refreshToken,
                                ein: tokens.expires_in,
                                date: tokens.date,
                            })
                        },
                        { method: 'post' }
                    );
                }, 1000);
            })()
        }
    }, [isReady, submit])

    return (
        <div className="flex flex-col items-center justify-center content-center h-screen text-main-color font-semibold">
            <Title />
            {
                text != "" ?
                <Link to="/host" className="text-4xl" data-cy="auth-text">{text}</Link> :
                <div className="loader"></div>
            }
        </div>
    );
}
