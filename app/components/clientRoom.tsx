import { Form } from "@remix-run/react"

import { FormatTime } from "~/utils/utils"
import type { RoomData } from "~/routes/room.$roomID"
import type { Party } from "~/server/api.server"

export default function ClientRoom(props: {
    username: string
    title: string
    isPlaying: boolean
    durationMS: number
    progressMS: number
    FetchData: () => void
    recentTracks: Array<SpotifyApi.PlayHistoryObject>
    tracksQueue: Array<SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull>
    partyTracksQ: Party['tracksQueue']
    setRoomData: React.Dispatch<Partial<RoomData>>
    searchResults: Array<SpotifyApi.TrackObjectFull>
    addTrackToQueue: (track: SpotifyApi.TrackObjectFull) => void
}) {
    const {
        username,
        title,
        durationMS,
        progressMS,
        recentTracks,
        tracksQueue,
        partyTracksQ,
        setRoomData,
        searchResults,
        addTrackToQueue
    } = props

    const tracksQElements: Array<JSX.Element | null> = []

    tracksQueue.forEach((track, i) => {
        const owner = partyTracksQ.find(trackOwner => trackOwner.trackId == track.id)

        tracksQElements.push(track.type == "episode" ? null : (
            <div key={i} className="text-lg">
                <span>{`[${i+1}]${owner ? ` (${owner.username})` : ""} ${track.name} - ${track.artists.map(a => a.name).join(', ')}`}</span>
            </div>
        ))
    })

    return (
        <>
            <nav className="absolute top-0 right-10 w-2/6 h-28 z-10 flex flex-row items-center justify-end content-center">
                <Form method="post">
                    <input type="hidden" name="username" value={username} />
                    <input type="hidden" name="type" value="leaveRoom" />
                    <button
                        type="submit"
                        className="text-2xl rounded-3xl w-36 border-2 duration-300 border-main-color hover:border-red-700 hover:text-red-700 hover:border-4 hover:scale-105"
                    >
                        {"Leave Room"}
                    </button>
                </Form>
            </nav>
            <section className="scrollsnap-page">
                <div className="flex flex-col items-center justify-center text-center w-10/12 m-auto my-28">
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
                            onChange={e => e.target.value = String(progressMS)}
                        />
                    </div>
                    <div className="scrollsnap-end-component flex flex-row items-center justify-center gap-x-10 py-6 border-t-[1px] border-main-color-hover w-full">
                        <div className="flex flex-col items-center justify-center content-center gap-2 w-full h-56 overflow-x-hidden">
                            <span className="text-2xl">Search a song to add to the queue:</span>
                            <input
                                className="rounded-lg outline-none"
                                type="text"
                                name="searchBar"
                                onChange={e => setRoomData({ searchInput: e.target.value })}
                            />
                            <div className="flex flex-row flex-wrap gap-2 justify-center overflow-y-scroll">
                                {searchResults.map(track => (
                                    <button
                                        key={track.id}
                                        className="border-[1px] border-[white] rounded-xl text-lg p-1 m-4 hover:scale-105"
                                        onClick={() => addTrackToQueue(track)}
                                    >
                                        {`${track.name} - ${track.artists.map(a => a.name).join(', ')}`}
                                    </button>
                                ))}
                            </div>
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
                </div>
            </section>
        </>
    )
}
