import { useEffect } from "react"
import { toast, ToastContainer } from "react-toastify"
import type {
	MetaFunction,
	LinksFunction,
	ActionFunction,
	LoaderFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import * as fs from "fs"
import path from "path"
import { AnimatePresence, motion } from "framer-motion"
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useFetcher,
	useLoaderData,
	useLocation,
} from "@remix-run/react"

import styles from "~/compiled.css"
import toastify from "react-toastify/dist/ReactToastify.min.css"
import Spotify from "./utils/spotify"
import { getSessionData } from "./server/session.server"
import { api } from "./server/handlers.server"

export type OutletContext = {
	username: 	string
	toast: 		typeof toast
}

type LoaderData = {
	id: 			string
	secret: 		string
	username: 		string
}

export const links: LinksFunction = () => {
	return [
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Montserrat:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
		},
		{
			rel: "stylesheet",
			href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css",
		},
		{
			rel: "stylesheet",
			href: toastify,
		},
		{
			rel: "stylesheet",
			href: styles,
		},
	]
}

export const meta: MetaFunction = () => ({
	charset: "utf-8",
	title: "Sharify",
	viewport: "width=device-width,initial-scale=1",
	keywords: "Sharify, Snoupix, Samuel Dewaele, Spotify, Share, Music, Party",
})

export const action: ActionFunction = async ({ request }) => {
	const username = await getSessionData(request, "username")

	if (username) {
		api.RemoveFromParty(username)
	}
	
	return null
}

export const loader: LoaderFunction = async ({ request }) => {
	const username = await getSessionData(request, "username") as string

	return json<LoaderData>({
		id: process.env.SPOTIFY_CLIENT_ID as string,
		secret: process.env.SPOTIFY_CLIENT_SECRET as string,
		username,
	})
}

function Document({
    children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<Meta />
				<title>Sharify</title>
				<Links />
			</head>
			<body className="bg-bg-color overflow-x-hidden">
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}

export default function App() {
	const loaderData = useLoaderData<LoaderData>()
	const fetcher = useFetcher()
	const { pathname } = useLocation()

	const contextData: OutletContext = {
		username: loaderData.username || "",
		toast,
	}

	useEffect(() => {
		Spotify.SetCredentials({ id: loaderData.id, secret: loaderData.secret })
	}, [loaderData])

	useEffect(() => {
		return () => fetcher.submit(null, { method: 'post' })
	}, [])

	return (
		<Document>
			<AnimatePresence mode="wait" initial={false}>
				<motion.main
					className="relative min-h-screen w-screen"
					key={pathname}
					initial={{ translateY: '2.5%' }}
					animate={{ translateY: '0%' }}
					exit={{ translateY: '2.5%' }}
					transition={{ duration: .2 }}
				>
					<Outlet context={contextData} />
					<ToastContainer />
				</motion.main>
			</AnimatePresence>
		</Document>
	)
}

export function CatchBoundary() {
	const caught = useCatch()
  
	return (
		<Document>
			<div className="error-container">
				<h1>
					{caught.status} {caught.statusText}
				</h1>
			</div>
		</Document>
	)
}

export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error)

	return (
		<Document>
			<div className="error-container">
				<h1>App Error</h1>
				<pre>{error.message}</pre>
			</div>
		</Document>
	)
}
