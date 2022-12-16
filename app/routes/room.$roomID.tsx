import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { useFetcher, useLoaderData, useNavigate, useOutletContext } from "@remix-run/react"
import { toast, ToastContainer } from "react-toastify"
import type { LoaderFunction, ActionFunction } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"

import { api } from "~/server/handlers.server"
import Title from "~/components/title"
import { GetStorageValue, SetStorageValue, useDebounce } from "~/utils/utils"
import spotify from "~/utils/spotify"
import { getSessionData } from "~/server/session.server"
import HostRoom from "~/components/hostRoom"
import ClientRoom from "~/components/clientRoom"
import type { Party } from "~/server/api.server"
import type { OutletContext } from "~/root"

export type RoomData = {
    title:          string
    searchInput:    string
    progressMS:     number
    durationMS:     number
    volume:         number
    seekPos:        number
    isPlaying:      boolean
    clients:        Party['clients']
    partyTracksQ:   Party['tracksQueue']
    currentDevice:  Party['currentDevice']
    devices:        Array<SpotifyApi.UserDevice>
    searchResults:  Array<SpotifyApi.TrackObjectFull>
    recentTracks:   Array<SpotifyApi.PlayHistoryObject>
    tracksQueue:    Array<SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull>
}

export type FetcherData = {
    isPartyDeleted: boolean
    clients:        Party['clients']
    tracksQueue:    Party['tracksQueue']
}

type LoaderData = {
    isHost:         boolean
    party:          Party,
    errorMessage:   string
    redirect:       string | undefined
}

export const action: ActionFunction = async ({
    request,
    params
}) => {
    const username = await getSessionData(request, "username")
    const formData = await request.formData()
	const fetchType = formData.get("type") as string
    const id = params.roomID

    if (!id || !username) {
        return redirect('/')
    }

    switch (fetchType) {
        case "fetchData":
            const currentTrack = formData.get("currentTrack") as string
            const party = api.GetParty(parseInt(id))

            if (!party) {
                return json<FetcherData>({
                    tracksQueue: [],
                    clients: [],
                    isPartyDeleted: true
                })
            }

            api.RemoveFromTracksQueue(parseInt(id), currentTrack)

            return json<FetcherData>({
                tracksQueue: party.tracksQueue,
                clients: party.clients,
                isPartyDeleted: false
            })
        case "deleteRoom":
            api.DeleteParty(parseInt(id), username)
            return redirect('/')
        case "leaveRoom":
            api.LeaveParty(parseInt(id), username)
            return redirect('/')
        case "addToQueue":
            const trackId = formData.get("trackId") as string
            const trackName = formData.get("trackName") as string

            api.AddToTracksQueue(parseInt(id), username, trackId, trackName)
            return null
        case "kick": {
            const target = formData.get("username") as string

            api.KickUser(parseInt(id), target)
            return null
        }
        case "ban": {
            const target = formData.get("username") as string

            api.BanUser(parseInt(id), target)
            return null
        }
    }

    return null
}

export const loader: LoaderFunction = async ({
    request,
    params
}) => {
    const id = params.roomID

    if (!id) {
        return redirect('/')
    }

    const party = api.GetParty(parseInt(id))

    if (!party) {
        return json({ errorMessage: "Error: Party not created or deleted", redirect: "/host" })
    }

    const username = await getSessionData(request, "username")

    if (!username) return redirect('/')

    if (!party.clients.find(client => client.username == username)) {
        return json({ errorMessage: `Error: You are not a member of the Party ${party.name} anymore`, redirect: "/" })
    }

    return json({
        party,
        isHost: party.clients.find(client => client.username == username)?.isHost
    })
}

export default function Room() {
    const loaderData = useLoaderData<LoaderData>()
    const context = useOutletContext<OutletContext>()
    const fetcher = useFetcher<FetcherData>()
    const navigate = useNavigate()
    const [isAllowed, setIsAllowed] = useState(true)
    const fetchDataTimeout = useRef<NodeJS.Timer | null>(null)
    const [fetchInterval, setFetchInterval] = useState<NodeJS.Timer>()
    const [syncInterval, setSyncInterval] = useState<NodeJS.Timer>()
    const [{
        title,
        volume,
        progressMS,
        durationMS,
        isPlaying,
        recentTracks,
        partyTracksQ,
        searchInput,
        searchResults,
        clients,
        currentDevice,
        devices,
        seekPos,
        tracksQueue
    }, setRoomData] = useReducer(
        (oldState: RoomData, newState: Partial<RoomData>): RoomData => ({...oldState, ...newState}),
        {
            title: "Loading...",
            volume: 99.9,
            progressMS: 0,
            durationMS: 0,
            isPlaying: false,
            recentTracks: [],
            partyTracksQ: [],
            searchInput: "",
            searchResults: [],
            clients: [],
            currentDevice: null,
            devices: [],
            seekPos: 0,
            tracksQueue: []
        }
    )

    const debounceVolume: number = useDebounce(volume, 600)
    const debounceSearch: string = useDebounce(searchInput, 600)
    const debounceSeek: number = useDebounce(seekPos, 500)

    const FetchData = useCallback((delay?: number) => {
        if (fetchDataTimeout.current)
            clearTimeout(fetchDataTimeout.current)

        fetchDataTimeout.current = setTimeout(() => {
            (async () => {
                fetchDataTimeout.current = null
                const [playbackData, recentTracks, queueData] =
                    await Promise.all([
                        spotify.GetCurrentTrackData(),
                        spotify.GetRecentlyPlayedTracks(5),
                        spotify.GetCurrentQueueData()
                    ])
        
                if (playbackData instanceof Error) {
                    toast.error(`Error: Failed to fetch current track (${playbackData.message})`, {
                        position: "bottom-right",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light",
                    })

                    console.error(playbackData.message)

                    return
                }
        
                if (recentTracks instanceof Error) {
                    toast.error(`Error: Failed to fetch recent tracks (${recentTracks.message})`, {
                        position: "bottom-right",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light",
                    })

                    console.error(recentTracks.message)

                    return
                }
        
                if (queueData instanceof Error) {
                    toast.error(`Error: Failed to fetch tracks in queue (${queueData.message})`, {
                        position: "bottom-right",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light",
                    })

                    console.error(queueData.message)

                    return
                }

                if (!playbackData || !playbackData.device.is_active) {
                    const devices = await spotify.GetDevices()

                    if (!(devices instanceof Error)) {
                        setRoomData({ currentDevice: null, devices })
                    }
                }

                if (!playbackData) {
                    return setRoomData({
                        title: "Play a music on Spotify to start using Sharify"
                    })
                }

                const currentTrack = playbackData.item
                const recentArr: Array<SpotifyApi.PlayHistoryObject> = []
                const queueArr: Array<SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull> = []

                recentTracks.forEach(track => {
                    if (!(track instanceof Error)) {
                        recentArr.push(track)
                    }
                })

                queueData.queue.forEach((track, i) => {
                    if (i >= 5) return
                    queueArr.push(track)
                })
        
                if (!currentTrack) return console.error("Couldn't fetch current track")
        
                if (currentTrack.type == "episode") return setRoomData({
                    title: currentTrack.name,
                    recentTracks: recentArr,
                    tracksQueue: queueArr,
                    durationMS: currentTrack.duration_ms,
                })

                return setRoomData({
                    title: `${currentTrack.name} - ${currentTrack.artists.map(artist => artist.name).join(', ')}`,
                    recentTracks: recentArr,
                    tracksQueue: queueArr,
                    durationMS: currentTrack.duration_ms,
                    progressMS: playbackData.progress_ms || 0,
                    isPlaying: playbackData.is_playing,
                    volume: playbackData.device.volume_percent || 50
                })
            })()
        }, delay || 500)
    }, [fetchDataTimeout, setRoomData])


    useEffect(() => {
        if (!isAllowed) return

        const interval = setInterval(() => fetcher.submit({
			type: "fetchData",
			username: context.username,
            currentTrack: title
		}, { method: "post" }), 1000)

        setFetchInterval(interval)

        const syncInterval = setInterval(() => FetchData(0), 10000)

        setSyncInterval(syncInterval)

        const timeout = setTimeout(() => FetchData(0), 1000)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
            clearInterval(syncInterval)
        }
    }, [title])

    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.isPartyDeleted) {
                const _toast = toast('The party has been deleted by the host!', {
                    position: "bottom-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                })

                const timeout = setTimeout(() => navigate('/'), 3000)

                setIsAllowed(false)

                return () => {
                    if (toast.isActive(_toast)) toast.dismiss(_toast)
                    clearTimeout(timeout)
                }
            }

            if (!fetcher.data.clients.find(client => client.username == context.username)) {
                clearInterval(fetchInterval)
                clearInterval(syncInterval)

                setIsAllowed(false)

                const _toast = toast('You have been kicked of the room by the host!', {
                    position: "bottom-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                })
                const timeout = setTimeout(() => navigate('/client'), 3000)

                return () => {
                    if (toast.isActive(_toast)) toast.dismiss(_toast)
                    clearTimeout(timeout)
                }
            }

            setRoomData({
                partyTracksQ: fetcher.data.tracksQueue,
                clients: fetcher.data.clients
            })
        }
    }, [fetcher.data])

    useEffect(() => {
        if (!isPlaying) return

        const timeout = setTimeout(() => {
            if (durationMS > 0 && progressMS >= durationMS) {
                clearTimeout(timeout)
                FetchData()
                return
            }

            setRoomData({ progressMS: progressMS + 1000 })
        }, 1000)

        return () => clearTimeout(timeout)
    }, [progressMS, durationMS, setRoomData, isPlaying, FetchData])

    useEffect(() => {
        if (debounceVolume == 99.9) return  // dodge initializer

        spotify.SetVolume(debounceVolume)
    }, [debounceVolume])

    useEffect(() => {
        if (debounceSearch.trim() == "") return  // dodge initializer

        spotify
            .SearchTracks(debounceSearch)
            .then(resp => {
                if (resp instanceof Error) return console.error(resp.message)

                setRoomData({ searchResults: resp.tracks?.items })
            })
            .catch(console.error)
    }, [debounceSearch])

    useEffect(() => {
        if (debounceSeek == 0) return  // dodge initializer

        spotify.Seek(debounceSeek)
    }, [debounceSeek])

    useEffect(() => {
        if (loaderData.errorMessage) {
            const _toast = toast.error(loaderData.errorMessage, {
                position: "bottom-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            })

            const timeout = setTimeout(() => navigate(loaderData.redirect || '/'), 3000)

            setIsAllowed(false)
    
            return () => {
                if (toast.isActive(_toast)) toast.dismiss(_toast)
                clearTimeout(timeout)
            }
        }

        SetStorageValue({
            st: {
                at: loaderData.party.spotifyCreds.accessToken,
                rt: loaderData.party.spotifyCreds.refreshToken,
                ein: loaderData.party.spotifyCreds.expiresIn,
                date: loaderData.party.spotifyCreds.date
            }
        })

        if (currentDevice) return

        const spotifyDevice = GetStorageValue("SpotifyDevice") as string

        if (spotifyDevice) {
            const device = JSON.parse(spotifyDevice) as SpotifyApi.UserDevice
            setRoomData({ currentDevice: device })
        } else if (spotify.currentDevice) {
            setRoomData({ currentDevice: spotify.currentDevice })
        } else {
            (async () => {
                const devices = await spotify.GetDevices()

                if (devices instanceof Error) {
                    toast.error(`Error: Failed to get devices (${devices.message})`, {
                        position: "bottom-right",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light",
                    })
        
                    return
                }

                setRoomData({ currentDevice: spotify.currentDevice, devices })
            })()
        }
    }, [loaderData, navigate])

    const addTrackToQueue = (track: SpotifyApi.TrackObjectFull) => {
        (async () => {
            const res = await spotify.AddNextTrack(track.external_urls.spotify)

            if (!(res instanceof Error)) {
                toast(`Added track ${track.name} - ${track.artists.map(a => a.name).join(', ')} to queue !`, {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                })
            }
    
            fetcher.submit({
                type: "addToQueue",
                trackId: track.id,
                trackName: `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`,
            }, { method: "post" })

            setRoomData({ searchResults: [] })
        })()
    }


    return (
        <>
            <Title />
            {isAllowed ?
                loaderData.errorMessage ? null : (
                    loaderData.isHost
                        ? <HostRoom
                            fetcher={fetcher}
                            username={context.username}
                            title={title}
                            volume={volume}
                            setRoomData={setRoomData}
                            isPlaying={isPlaying}
                            durationMS={durationMS}
                            progressMS={progressMS}
                            FetchData={FetchData}
                            clients={clients}
                            recentTracks={recentTracks}
                            tracksQueue={tracksQueue}
                            partyTracksQ={partyTracksQ}
                            currentDevice={currentDevice}
                            devices={devices}
                            searchResults={searchResults}
                            addTrackToQueue={addTrackToQueue}
                        />
                        : <ClientRoom
                            username={context.username}
                            title={title}
                            isPlaying={isPlaying}
                            durationMS={durationMS}
                            progressMS={progressMS}
                            FetchData={FetchData}
                            recentTracks={recentTracks}
                            tracksQueue={tracksQueue}
                            partyTracksQ={partyTracksQ}
                            setRoomData={setRoomData}
                            searchResults={searchResults}
                            addTrackToQueue={addTrackToQueue}
                        />
                )
            : null}
            <ToastContainer />
        </>
    )
}

export const Icon = (props: {
    classStr: string,
    onClick?: React.MouseEventHandler<HTMLDivElement> | undefined,
}) => {
    const { classStr, onClick } = props

    return (
        <div
            className="flex text-center items-center justify-center cursor-pointer rounded-full hover:bg-main-color-hover/30 w-12 h-12"
            onClick={onClick}
        >
            <i className={`${classStr} text-2xl`}></i>
        </div>
    )
}
