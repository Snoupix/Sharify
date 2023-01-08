import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import type { ActionFunction } from "@remix-run/node";
import { Link, useSubmit } from "@remix-run/react";

import Title from "~/components/title";
import Spotify from "~/utils/spotify";
import { unsetSessionData } from "~/server/session.server";
import { GetStorageValue } from "~/utils/utils";

export const action: ActionFunction = async ({
	request
}) => {
	const formData = await request.formData();
	const deleteSTokens = formData.get('DeleteSpotifyTokens') as string || false;

	if (deleteSTokens) {
		return await unsetSessionData(request, "SpotifyTokens", "/");
	}
	
	return null;
}

export default function Index() {
	const submit = useSubmit();
	const [spotifyUser, setSpotifyUser] = useState<SpotifyApi.CurrentUsersProfileResponse | null>(null);

	useEffect(() => {
		if (Spotify.isReady) {
			(async () => {
				const profile = await Spotify.GetProfile();

				if (!(profile instanceof Error)) {
					setSpotifyUser(profile);
				}
			})()
		} else if (GetStorageValue("st") != null && !Spotify.isReady) {
			(async () => {
				const profile = await Spotify.GetProfile();

				if (!(profile instanceof Error)) {
					setSpotifyUser(profile);
				}
			})()
		}
	}, [])

	const handleSpotifyDisconnect = () => {
		toast(`[Spotify] Disconnected from ${spotifyUser?.display_name} !`, {
			position: "bottom-right",
			autoClose: 2500,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			theme: "light",
		})
		
		submit({ DeleteSpotifyTokens: "true" }, { method: "post" })

		Spotify.Disconnect()
		setSpotifyUser(null)
	}
	
	return (
		<>
			<nav className="fixed top-0 left-0 h-14 w-screen">

			</nav>
			<div className="h-screen flex flex-col justify-center items-center content-center gap-y-4 md:gap-y-6 xl:gap-y-9">
				<Title />
				<Link
					className="duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color"
					to="/host"
					data-cy="host-link"
				>
					Host
				</Link>
				<Link
					className="duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color"
					to="/client"
					data-cy="client-link"
				>
					Client
				</Link>
				{spotifyUser ? (
					<div data-cy="horizontal-bar" className="border-t-[1px] border-indigo-700 w-[20%]"></div>
				) : null}
				{spotifyUser ? (
					<button
						className="duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color"
						onClick={handleSpotifyDisconnect}
						data-cy="disconnect-btn"
					>
						<span className="text-xl xl:text-2xl">{`Disconnect from ${spotifyUser.display_name}`}</span>
					</button>
				) : null}
			</div>
			<ToastContainer />
		</>
	)
}
