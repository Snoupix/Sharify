import { useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import { Link } from "@remix-run/react"

import Title from "~/components/title"
import Spotify from "~/utils/spotify"

export default function Index() {
	const [spotifyUser, setSpotifyUser] = useState<SpotifyApi.CurrentUsersProfileResponse | null>(null)

	useEffect(() => {
		if (Spotify.isReady) {
			(async () => {
				const profile = await Spotify.GetProfile()

				if (!(profile instanceof Error)) {
					setSpotifyUser(profile)
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
		Spotify.Disconnect() // to fix, it does not disconnect 
		setSpotifyUser(null)
	}
	
	return (
		<>
			<nav className="fixed top-0 left-0 h-14 w-screen">

			</nav>
			<div className="h-screen flex flex-col justify-center items-center content-center gap-y-4 md:gap-y-6 xl:gap-y-9">
				<Title />
				<Link className="duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color" to="/host" >Host</Link>
				<Link className="duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color" to="/client">Client</Link>
				{spotifyUser ? (
					<div>
						<div className="border-t-[1px] border-indigo-700"></div>
						<button
							className="duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color"
							onClick={handleSpotifyDisconnect}
						>
							{`[Spotify] Disconnect from ${spotifyUser.display_name}`}
						</button>
					</div>
				) : null}
			</div>
			<ToastContainer />
		</>
	)
}
