import { toast, ToastContainer } from "react-toastify"
import { useEffect, useRef, useState } from "react"
import { json, redirect } from "@remix-run/node"
import type { LoaderFunction, ActionFunction } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useOutletContext, useSubmit } from "@remix-run/react"

import Title from "~/components/title"
import type { Party } from "~/server/api.server"
import { api } from "~/server/handlers.server"
import Spotify from "~/app/utils/spotify"
import { getSessionData, setSessionData, unsetSessionData } from "~/server/session.server"
import type { OutletContext } from "~/root"

type ActionData = {
    errorMessage: string
}

type LoaderData = {
    parties: Array<Party>
}

export const action: ActionFunction = async ({
    request
}) => {
    const formData = await request.formData()
	const deleteSTokens = formData.get('DeleteSpotifyTokens') as string || false

	if (deleteSTokens) {
		await unsetSessionData(request, "SpotifyTokens", "/")
	}

    const username = formData.get("username") as string
    const partyID = formData.get("partyID") as string
    const password = formData.get("partyPwd") as string

    if (!partyID) {
        throw new Error("Party ID not found, please contact Snoupix")
    }

    const party = api.GetParty(parseInt(partyID))

    if (!username) {
        throw new Error("Username not found, please contact Snoupix")
    }

    if (!party) {
        return json({ errorMessage: `Party id ${partyID} doesn't exist anymore.` })
    }

    if (party.isPrivate && party.password != password) {
        return json({ errorMessage: `Error: Party password incorrect` })
    }

    if (api.UsernameExists(username)) {
        return json({ errorMessage: `Error: There is already a Sharify member called "${username}"` })
    }

    const error = api.JoinParty(parseInt(partyID), username)

    if (error) {
        return json({ errorMessage: error.message })
    }
    
    return await setSessionData(request, "username", username, `/room/${partyID}`)
}

export const loader: LoaderFunction = async ({
    request
}) => {
    const username = await getSessionData(request, "username")

	if (username) {
        const party = api.GetUserParty(username)
    
        if (party != null) {
            return redirect(`/room/${party.id}`)
        }
	}

    const parties = api.GetParties(false)

    return json({ parties })
}

export default function Client() {
    const loaderData = useLoaderData<LoaderData>()
    const actionData = useActionData<ActionData>()
    const context = useOutletContext<OutletContext>()
    const submit = useSubmit()
    const [parties, setParties] = useState<Array<Party>>([])
    const [showUP, setShowUP] = useState(false) // username popup
    const [showPP, setShowPP] = useState(false) // password popup
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [partyData, setPartyData] = useState<{
        id: number
        isPrivate: boolean
    } | null>(null)

    useEffect(() => {
        if (loaderData.parties) {
            setParties(loaderData.parties.filter(
                party => !party.bannedClients.includes(context.username)
            ))
        }

        if (Spotify.isReady && !Spotify.isOwner) {
            submit({ DeleteSpotifyTokens: "true" }, { method: "post" })
        }

        setUsername(context.username)
    }, [loaderData])

    useEffect(() => {
        if (actionData && actionData.errorMessage) {
            const _toast = toast.error(actionData.errorMessage, {
                position: "bottom-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            })

            setUsername("")
            setPassword("")
    
            return () => toast.isActive(_toast) ? toast.dismiss(_toast) : undefined
        }
    }, [actionData])

    useEffect(() => {
        if (
            !showUP && !showPP && partyData != null &&
            (username.trim() != "" || password != "")
        ) {
            handleJoin(partyData.id, partyData.isPrivate)
        }
    }, [showUP, showPP])

    const handleJoin = (id: number, isPrivate: boolean) => {
        setPartyData({ id, isPrivate })

        if (!username || username.trim() == "") {
            setShowUP(true)
            return
        }

        if (isPrivate && password == "") {
            setShowPP(true)
            return
        }

        submit(
            {
                username,
                partyID: String(id),
                partyPwd: password
            },
            { method: "post" }
        )
    }

    return (
        <>
            <Title />
            <section className="h-screen">
                <div data-cy="div-rooms-array" className="relative m-auto mt-28 w-3/5 h-3/5 flex flex-col overflow-y-scroll border-[1px] border-main-color-hover rounded-lg shadow-around">
                    {parties && parties.length > 0 ? parties.map(party => (
                        <Form
                            data-cy="client-form-room"
                            onClick={() => handleJoin(party.id, party.isPrivate)}
                            key={party.id}
                            className={"cursor-pointer flex flex-row justify-center text-2xl py-4 border-b-[1px] duration-300 hover:text-slate-400" + (
                                party.id % 2 == 0 ? " text-indigo-600" : ""
                            )}
                        >
                            {`[${party.id}] ${party.name} | ${party.clients.length}/${party.MAX_CLIENTS} | `}
                            {party.type == "Spotify" ? <i className="fab fa-spotify pl-2.5 pr-1 mt-1 text-[currentColor]"></i> : <i className="fab fa-youtube pl-2.5 pr-1 mt-1 text-[currentColor]"></i>}
                            {party.isPrivate ? ' | ' : ''}
                            {party.isPrivate ? <i className="fas fa-lock pl-2.5 mt-[.15rem] text-[currentColor]"></i> : ''}
                        </Form>
                    )) : null}
                    {loaderData && loaderData.parties && loaderData.parties.length == 0 ? (
                        <span className="text-center text-3xl m-auto">No parties found</span>
                    ) : null}
                    <PasswordPopup
                        display={showPP}
                        setDisplay={setShowPP}
                        setPassword={setPassword}
                    />
                    <UsernamePopup
                        display={showUP}
                        setDisplay={setShowUP}
                        username={username}
                        setUsername={setUsername}
                    />
                </div>
            </section>
            <ToastContainer />
        </>
    )
}

const UsernamePopup = (
    props: {
        display: boolean
        setDisplay: React.Dispatch<React.SetStateAction<boolean>>
        username: string
        setUsername: React.Dispatch<React.SetStateAction<string>>
    }
) => {
    const { display, setDisplay, username, setUsername } = props
    const inputRef = useRef<HTMLInputElement>(null)

    if (display) {
        setTimeout(() => inputRef.current?.focus(), 500)
    }

    return (
        <div className={`absolute top-0 left-0 h-full w-[100%] flex-col justify-center items-center gap-5 backdrop-blur-sm duration-300 ${display ? "flex" : "hidden"}`}>
            <span className="text-center text-3xl">First of all, you need to register your username</span>
            <input
                data-cy="client-username"
                ref={inputRef}
                type="text"
                className="form-input"
                placeholder="Username"
                defaultValue={username}
                onChange={e => setUsername(e.target.value)}
            />
            <button data-cy="client-username-submit" className="text-2xl" onClick={() => setDisplay(false)}>Close</button>
        </div>
    )
}

const PasswordPopup = (
    props: {
        display: boolean
        setDisplay: React.Dispatch<React.SetStateAction<boolean>>
        setPassword: React.Dispatch<React.SetStateAction<string>>
    }
) => {
    const { display, setDisplay, setPassword } = props
    const inputRef = useRef<HTMLInputElement>(null)

    if (display) {
        setTimeout(() => inputRef.current?.focus(), 500)
    }

    return (
        <div className={`absolute top-0 left-0 h-full w-[100%] flex-col justify-center items-center gap-5 backdrop-blur-sm duration-300 ${display ? "flex" : "hidden"}`}>
            <span className="text-center text-3xl">Type the correct Party password</span>
            <input
                data-cy="client-party-password"
                ref={inputRef}
                type="password"
                className="form-input w-full"
                placeholder="Party password"
                onChange={e => setPassword(e.currentTarget.value)}
            />
            <button data-cy="client-party-password-submit" className="text-2xl" onClick={() => setDisplay(false)}>Close</button>
        </div>
    )
}
