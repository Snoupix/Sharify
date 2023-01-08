import { json } from "@remix-run/node"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { useEffect, useState } from "react"
import { Link, useLoaderData, useSubmit } from "@remix-run/react"

import Title from "~/components/title"
import { getSessionData, setSessionData } from "~/server/session.server"

import Spotify from "~/utils/spotify"

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
    const formData = await request.formData()
    const sTokens = formData.get("spotifyTokens") as string

    return await setSessionData(request, "SpotifyTokens", sTokens, "/host")
}

export const loader: LoaderFunction = async ({
    request
}) => {
    const SpotifyTokens = await getSessionData(request, "SpotifyTokens")

    if (SpotifyTokens) {
        return json({ SpotifyTokens: JSON.parse(SpotifyTokens) })
    }

    return null
}

export default function Auth_Spotify() {
    const loaderData = useLoaderData<LoaderData>()
    const submit = useSubmit()
	const [text, setText] = useState("")
    const [fetched, setFetched] = useState(false)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            if (Spotify.isReady) {
                setIsReady(true)
                clearInterval(interval)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (fetched) return

        const params = new URLSearchParams(location.search)
        const code = params.get("code")
        const error = params.get("error")

        if (code) {
            setFetched(true)
            return Spotify.FetchAccessToken(code)
        }

        if (error) {
            setFetched(true)
            return setText(`Error: ${error}`)
        }

        if (loaderData && loaderData.SpotifyTokens) {
            const expires_in = (
                loaderData.SpotifyTokens.ein > 0 && loaderData.SpotifyTokens.ein <= 3600
                    ? loaderData.SpotifyTokens.ein
                    : 3600
            ) * 1000
            const msDiff = (loaderData.SpotifyTokens.date + expires_in) - Date.now()

            if (msDiff > 0) {
                setFetched(true)
                return Spotify.ProcessTokens({
                    access_token: loaderData.SpotifyTokens.sat,
                    refresh_token: loaderData.SpotifyTokens.srt,
                    expires_in: loaderData.SpotifyTokens.ein,
                    createdAt: loaderData.SpotifyTokens.date
                })
            }
        }

        location.replace(Spotify.GetAuthLink())
    }, [loaderData, fetched])

    useEffect(() => {
        if (isReady) {
            (async () => {
                setFetched(true)

                const profile = await Spotify.GetProfile()

                if (!(profile instanceof Error)) {
                    setText(`Successfully connected to ${profile.display_name}`)
                }
                
                const tokens = Spotify.GetTokens()
    
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
                    )
                }, 1000)
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
    )
}
