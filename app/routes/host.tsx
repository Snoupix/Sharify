import { toast, ToastContainer } from "react-toastify"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useCatch, useLoaderData, useNavigate, useOutletContext, useParams, useSubmit } from "@remix-run/react"
import { useEffect, useReducer, useRef, useState } from "react"

import Title from "~/components/title"
import { api } from "~/server/handlers.server"
import type { Party } from "~/server/api.server"
import { PartyError } from "~/server/api.server"
import Spotify from "~/utils/spotify"
import { getSessionData, setSessionData } from "~/server/session.server"
import type { OutletContext } from "~/root"

type LoaderData = {
	spotifyTokens: {
		sat: string
		srt: string
		ein: number
		date: number
	}
}

type ActionData = {
	errorMessage: string | undefined
}

type FormData = {
	username: 	string
	name: 		Party['name']
	isPrivate: 	Party['isPrivate']
	password: 	string
	type: 		Party['type'] | null
	sat: 		string
	srt: 		string
	sd: 		number
	sdate: 		number
}

type ConnectedType = {
	spotify: boolean
	youtube: boolean
}

export const action: ActionFunction = async ({
	request
}) => {
	const formData = await request.formData()
	const _data = formData.get('data') as string

	if (!_data) return json({ errorMessage: "Error: Cannot retrieve data, please, contact Snoupix" })

	const data: FormData = JSON.parse(_data)

	const party = api.CreateParty(
		[{
			isHost: true,
			username: data.username
		}],
		data.name,
		data.isPrivate,
		data.type || "Spotify",
		{
			accessToken: data.sat,
			refreshToken: data.srt,
			expiresIn: data.sd,
			date: data.sdate
		},
		data.isPrivate ? data.password : undefined
	)

	if (party instanceof PartyError) {
		throw new Response(party.message, { status: 404 })
	}

	return await setSessionData(request, "username", data.username, `/room/${party.id}`)
}

export const loader: LoaderFunction = async ({
	request
}) => {
	const username = await getSessionData(request, "username")
	const sTokens = await getSessionData(request, "SpotifyTokens")

	if (username) {
		const party = api.GetUserParty(username)

		if (party) {
			return redirect(`/room/${party.id}`)
		}
	}

	if (sTokens) {
		return json({ spotifyTokens: JSON.parse(sTokens) })
	}

	return null
}

export default function Host() {
	const loaderData = useLoaderData<LoaderData>()
	const actionData = useActionData<ActionData>()
	const context = useOutletContext<OutletContext>()
	const submit = useSubmit()
	const navigate = useNavigate()
	const formRef = useRef<HTMLFormElement>(null)
	const [connectedTo, setConnectedTo] = useState<ConnectedType>({ spotify: false, youtube: false })
	const [dataToSend, setDataToSend] = useState("")
	const [formState, setFormState] = useReducer(
		(state: FormData, newState: Partial<FormData>) => {
			setDataToSend(JSON.stringify({ ...state, ...newState }))
			return { ...state, ...newState }
		},
		{
			username: "",
			name: "",
			isPrivate: false,
			password: "",
			type: null,
			sat: "",
			srt: "",
			sd: 0,
			sdate: 0
		}
	)


	useEffect(() => {
		if (Spotify.isReady) {
			(async () => {
				const profile = await Spotify.GetProfile()

				if (!(profile instanceof Error)) {
					toast(`[Spotify] Connected as ${profile.display_name}`, {
						position: "bottom-right",
						autoClose: 2500,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						theme: "light",
					})
				}

				setFormState({
					sat: loaderData.spotifyTokens.sat,
					srt: loaderData.spotifyTokens.srt,
					sd: loaderData.spotifyTokens.ein,
					sdate: loaderData.spotifyTokens.date,
					username: context.username,
					type: "Spotify",
				})
	
				setConnectedTo(prev => ({ ...prev, spotify: true }))
			})()
		}

		/* if (loaderData.youtubeName) {
			const _toast = toast(`[Youtube] Connected to ${loaderData.youtubeName}`, {
				position: "bottom-right",
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "light",
			})

			setFormState({type: "Youtube"})

			setConnectedTo(prev => ({...prev, youtube: true}))

			return () => toast.isActive(_toast) ? toast.dismiss(_toast) : undefined
		} */
	}, [])

	useEffect(() => {
		if (actionData?.errorMessage) {
			const _toast = toast.error(actionData.errorMessage, {
				position: "bottom-right",
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "dark",
			})

			return () => toast.isActive(_toast) ? toast.dismiss(_toast) : undefined
		}
	}, [actionData])
	
	const checkFormInputs = (): boolean => {
		if (
			formState.name == "" ||
			formState.type == null ||
			(formState.isPrivate && formState.password == "") ||
			formState.username.trim() == ""
		) {
			return false
		}
	
		return true
	}

	const handleSubmit = () => {	
		if (checkFormInputs() && formRef.current) {
			submit(formRef.current, { method: "post" })
		} else {
			toast.error("Error: Missing fields", {
				position: "bottom-right",
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "dark",
			})
		}
	}

	return (
		<section className="h-screen">
			<Title />
			<Form
				ref={formRef}
				className="flex flex-col justify-center items-center content-center h-full gap-y-6"
				onSubmit={e => e.preventDefault()}
			>
				{
					formState.type == null ? (
						<>
							<span className="text-2xl">Party type</span>
							<div className="flex flex-row gap-x-4">
								<button
									className={'text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 ' + (formState.type == 'Spotify' ? 'text-[white] shadow-backRight shadow-main-color scale-105' : '')}
									onClick={() => connectedTo.spotify ? setFormState({ type: 'Spotify' }) : navigate('/auth_spotify')}
								>
									Spotify
								</button>
								{/* <button
									className={'text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 ' + (formState.type == 'Youtube' ? 'text-[white] shadow-backRight shadow-main-color scale-105' : '')}
									onClick={() => connectedTo.youtube ? setFormState({ type: 'Youtube' }) : navigate('/auth_youtube')}
								>
									Youtube
								</button> */}
							</div>
						</>
					) : (
						<>
							<div className="flex flex-row">
								{formState.type == "Spotify" ? <i className="fab fa-spotify text-3xl text-[currentColor]"></i> : <i className="fab fa-youtube text-3xl text-[currentColor]"></i>}
							</div>
							<input type="hidden" name="srt" value={formState.srt} />
							<input type="hidden" name="sat" value={formState.sat} />
							<input type="hidden" name="data" value={dataToSend} />
							<input
								autoFocus
								className="form-input"
								type="text"
								maxLength={20}
								placeholder="Username"
								spellCheck={false}
								defaultValue={formState.username}
								onChange={e => setFormState({ username: e.currentTarget.value == "" ? 'Guest' : e.currentTarget.value })}
							/>
							<input
								className="form-input"
								type="text"
								maxLength={20}
								placeholder="Party's name"
								spellCheck={false}
								onChange={e => setFormState({ name: e.currentTarget.value })}
							/>
							<span className="text-2xl">Is the party private ?</span>
							<div className="flex flex-row gap-x-4">
								<button
									className={'text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 ' + (formState.isPrivate ? 'text-[white] shadow-backRight shadow-main-color scale-105' : '')}
									onClick={() => !formState.isPrivate ? setFormState({ isPrivate: true, password: "" }) : null}
								>
									Yes
								</button>
								<button
									className={'text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 ' + (!formState.isPrivate ? 'text-[white] shadow-backRight shadow-main-color scale-105' : '')}
									onClick={() => formState.isPrivate ? setFormState({ isPrivate: false, password: "" }) : null}
								>
									No
								</button>
							</div>
							<input
								className={formState.isPrivate ? "form-input block" : "hidden"}
								type="password"
								name="password"
								placeholder="Password"
								onChange={e => setFormState({ password: e.currentTarget.value })}
							/>
							<button className="form-input mt-4 text-lg md:text-xl xl:text-2xl rounded-lg border-[1px] px-5 py-3 border-main-color hover:shadow-around text-shadow" type="submit" onClick={handleSubmit}>Create your party</button>
						</>
					)
				}
		  	</Form>
			<ToastContainer />
		</section>
	)
}

export function ErrorBoundary() {
	return (
		<div className="error-container">
			{`An error has occured while creating a party.`}
		</div>
	)
}

export function CatchBoundary() {
	const caught = useCatch()
	const params = useParams()

	if (caught.status === 404) {
		return (
			<div className="error-container">
				{`[${caught.status}] ${caught.data} (${params.roomID})`}
			</div>
		)
	}

	throw new Error(`Unhandled error: ${caught.status} ${caught.data} ${params.roomID}`)
}
