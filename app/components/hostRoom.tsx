import { useState } from "react"
import { Form } from "@remix-run/react"
import type { FetcherWithComponents } from "@remix-run/react"

import { Icon } from "~/routes/room.$roomID"
import type { FetcherData, RoomData } from "~/routes/room.$roomID"
import spotify from "~/utils/spotify"
import { FormatTime, SetStorageValue } from "~/utils/utils"
import type { Party } from "~/server/api.server"

export default function HostRoom(props: {
    fetcher: FetcherWithComponents<FetcherData>
    username: string
    title: string
    volume: number
    setRoomData: React.Dispatch<Partial<RoomData>>
    isPlaying: boolean
    durationMS: number
    progressMS: number
    FetchData: (delay?: number) => void
    clients: Party['clients']
    recentTracks: Array<SpotifyApi.PlayHistoryObject>
    tracksQueue: Array<SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull>
    partyTracksQ: Party['tracksQueue']
    currentDevice: Party['currentDevice']
    devices: Array<SpotifyApi.UserDevice>
    searchResults: Array<SpotifyApi.TrackObjectFull>
    addTrackToQueue: (track: SpotifyApi.TrackObjectFull) => void
}) {
    const {
        fetcher,
        username,
        title,
        volume,
        setRoomData,
        isPlaying,
        durationMS,
        progressMS,
        FetchData,
        clients,
        recentTracks,
        tracksQueue,
        partyTracksQ,
        currentDevice,
        devices,
        searchResults,
        addTrackToQueue
    } = props
    const [showVolume, setShowVolume] = useState(false)

    const tracksQElements: Array<JSX.Element | null> = []

    tracksQueue.forEach((track, i) => {
        const owner = partyTracksQ.find(trackOwner => trackOwner.trackId == track.id)

        tracksQElements.push(track.type == "episode" ? null : (
            <div key={i} className="text-lg">
                <span>{`[${i+1}]${owner ? ` (${owner.username})` : ""} ${track.name} - ${track.artists.map(a => a.name).join(', ')}`}</span>
            </div>
        ))
    })

    const handlePlay = () => {
        spotify
            .Resume()
            .then(() => FetchData(250))
            .catch(console.error)
    }

    const handlePause = () => {
        spotify
            .Pause()
            .then(() => FetchData(250))
            .catch(console.error)
    }

    const handleNext = () => {
        spotify
            .SkipToNext()
            .then(() => FetchData(500))
            .catch(console.error)
    }

    const handlePrevious = () => {
        if ((durationMS - progressMS) < durationMS / 2) {
            return spotify
                .Seek(0)
                .then(() => FetchData(500))
                .catch(console.error)
        }

        spotify
            .SkipToPrevious()
            .then(() => FetchData(500))
            .catch(console.error)
    }

    const handleSeek: React.ChangeEventHandler<HTMLInputElement> = e => {
        setRoomData({ seekPos: parseInt(e.target.value) })
        FetchData(1000)
    }

    const setSpotifyDevice = (device: SpotifyApi.UserDevice) => {
        spotify.SetDevice(device)
    
        SetStorageValue({ SpotifyDevice: JSON.stringify(device) })
    
        fetcher.submit(
            { type: "setSpotifyDevice", spotifyDevice: JSON.stringify(device) },
            { method: 'post' }
        )
    }

    return (
        <>
            <nav className="absolute top-0 right-10 w-2/6 h-28 z-10 flex flex-row items-center justify-end content-center">
                <Form method="post">
                    <input type="hidden" name="username" value={username} />
                    <input type="hidden" name="type" value="deleteRoom" />
                    <button
                        type="submit"
                        className="text-2xl rounded-3xl w-36 border-2 duration-300 border-main-color hover:border-red-700 hover:text-red-700 hover:border-4 hover:scale-105"
                    >
                        {"Delete Room"}
                    </button>
                </Form>
            </nav>
            <section className="scrollsnap-page">
                <div className="flex flex-col items-center justify-center text-center w-10/12 m-auto my-28">
                    {!currentDevice ? (
                        <div>
                            <span className="text-2xl p-6">Select a Device to use</span>
                            {devices.map(device => (
                                <button
                                    key={device.name}
                                    className="text-2xl form-input rounded-xl"
                                    onClick={() => setSpotifyDevice(device)}
                                >
                                    {`${device.name} (${device.is_active ? "Active" : "Inactive"})`}
                                </button>
                            ))}
                        </div>
                    ) : null}
                    <span className="text-2xl p-6">{title}</span>
                    <div className="flex flex-col gap-5 mb-5">
                        <span>{FormatTime(progressMS, durationMS)}</span>
                        <input
                            type="range"
                            min={0}
                            max={durationMS}
                            defaultValue={progressMS}
                            className="accent-indigo-700"
                            draggable={false}
                            onChange={handleSeek}
                        />
                    </div>
                    <div className="scrollsnap-start-component flex flex-row items-center justify-center gap-x-10 py-6 border-y-[1px] border-main-color-hover w-full">
                        <Icon classStr="fa-solid fa-backward-step" onClick={handlePrevious} />
                        {
                            isPlaying
                                ? <Icon classStr="fa-solid fa-pause" onClick={handlePause} />
                                : <Icon classStr="fa-solid fa-play" onClick={handlePlay} />
                        }
                        <Icon classStr="fa-solid fa-forward-step" onClick={handleNext} />
                        {volume >= 50 ? (
                            <Icon onClick={() => setShowVolume(v => !v)} classStr="fa-solid fa-volume-high" />
                        ) : null}
                        {volume < 50 && volume > 0 ? (
                            <Icon onClick={() => setShowVolume(v => !v)} classStr="fa-solid fa-volume-low" />
                            ) : null}
                        {volume == 0 ? (
                            <Icon onClick={() => setShowVolume(v => !v)} classStr="fa-solid fa-volume-xmark" />
                        ) : null}
                        {showVolume ? (
                            <div className="flex flex-col text-center items-center justify-center">
                                <span className="text-xl">{volume} %</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={volume}
                                    className="accent-main-color"
                                    onChange={e => setRoomData({ volume: parseInt(e.currentTarget.value) })}
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className="scrollsnap-start-component flex flex-row w-full">
                        <div className="flex flex-col flex-wrap h-80 w-full">
                            <span className="text-2xl">Party members:</span>
                            {clients.map(client => (
                                <div className="flex flex-row flex-wrap gap-3 justify-center items-center max-w-[50%]" key={client.username}>
                                    <span className={`input-form text-3xl ${client.isHost ? "text-main-color" : "text-indigo-700"}`}>
                                        {client.username}
                                    </span>
                                    {!client.isHost ? (
                                        <>
                                            <Form method="post">
                                                <input type="hidden" name="username" value={client.username} />
                                                <input type="hidden" name="type" value="kick" />
                                                <button type="submit">Kick</button>
                                            </Form>
                                            <Form method="post">
                                                <input type="hidden" name="username" value={client.username} />
                                                <input type="hidden" name="type" value="ban" />
                                                <button type="submit">Ban</button>
                                            </Form>
                                        </>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-row justify-center items-center content-center text-center w-full gap-5 pb-5">
                            <div className="w-full flex flex-col gap-2">
                                <span className="text-2xl">Coming next:</span>
                                {tracksQElements.map(el => el)}
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <span className="text-2xl">Previously played:</span>
                                {recentTracks.map((trackData, i) => (
                                    <div key={i} className="text-lg">
                                        <span>
                                            {`[${i+1}] ${trackData.track.name} - ${trackData.track.artists.map(a => a.name).join(', ')}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="scrollsnap-end-component flex flex-col items-center justify-center content-center gap-2 border-t-[1px] border-main-color-hover w-full h-56">
                        <span className="text-2xl">Search a song to add to the queue:</span>
                        <input
                            className="rounded-lg outline-none"
                            type="text"
                            name="searchBar"
                            onChange={e => setRoomData({ searchInput: e.target.value })}
                        />
                        <div className="flex flex-row flex-wrap gap-5 justify-center overflow-y-scroll">
                            {searchResults.map(track => (
                                <button
                                    key={track.id}
                                    className="border-[1px] border-[white] rounded-xl text-lg p-1 mt-4 hover:scale-105"
                                    onClick={() => addTrackToQueue(track)}
                                >
                                    {`${track.name} - ${track.artists.map(a => a.name).join(', ')}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
