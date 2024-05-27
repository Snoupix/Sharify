<script lang="ts">
	import websocket from "websocket";
	import { getContext, hasContext, onDestroy, onMount } from "svelte";
	import { page } from "$app/stores";
	import type { Writable } from "svelte/store";
	import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
	import { Eye, EyeOff, Link, LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-svelte";

	import ws, { init_ws } from "$/lib/ws_store";
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import { Button } from "$/components/ui/button";
	import { Input } from "$/components/ui/input";
	import CustomButton from "$/components/button.svelte";
	import { FormatTime, GetStorageValue, SetStorageValue, WriteToClipboard, zip_iter } from "$/lib/utils";
    import type { Party, SpotifyData, SpotifyTrack, WsMessage } from "$/lib/types";
	import { LEAVE_PARTY } from "$/lib/queries";

	if (!hasContext("GQL_Client")) {
		throw new Error("Unexpected error: Unable to get GraphQL client on context, please contact Snoupix");
	}

	if (!hasContext("RoomData")) {
		throw new Error("Unexpected error: Unable to get room data context, please contact Snoupix");
	}

	if (!hasContext("SpotifyData")) {
		throw new Error("Unexpected error: Unable to get spotify data context, please contact Snoupix");
	}

	const room_data: Writable<Party | null> = getContext("RoomData");
    const spotify_data: Writable<SpotifyData | null> = getContext("SpotifyData");
	const client: Writable<ApolloClient<NormalizedCacheObject> | null> = getContext("GQL_Client");

	if ($client == null) {
		throw new Error("Unexpected error: Unable to initiate GraphQL client, please contact Snoupix");
	}

    let _seek_debounce: NodeJS.Timeout | null = null;
    let _search_debounce: NodeJS.Timeout | null = null;
    let _volume_debounce: NodeJS.Timeout | null = null;
    let leaving = false;
	let show_link = false;
    let song_progress_ms = -1;
    let song_loop: NodeJS.Timeout | null = null;
    let search_input = ""
    let search_results: Array<SpotifyTrack> = [];
    let volume = -1;
    let show_volume = false;
    let url_uri_input = "";

	onMount(async () => {
		const pathname_split = $page.url.pathname.split("/");

		if (pathname_split.length != 4) {
			toast.push("Unexpected error: Bad pathname", { duration: 2500 });
			await goto("/");
		}

		const [room_id, client_id] = pathname_split.slice(2).map(n => parseInt(n));

		init_ws(room_id, client_id, undefined, undefined, on_ws_error, on_ws_message);

        song_loop = setInterval(() => {
            if (
                $spotify_data == null ||
                $spotify_data.playback_state == null ||
                $spotify_data.playback_state.is_playing == false ||
                song_progress_ms >= $spotify_data.playback_state.duration_ms
            ) return;

            song_progress_ms += 1000;
        }, 1000);
	});

	onDestroy(() => {
        $ws?.close();
        song_loop && clearInterval(song_loop);
    });

	function on_ws_message(message: websocket.IMessageEvent) {
		if (typeof message.data != "string") {
			return;
		}

        try {
            const message_data = JSON.parse(message.data) as WsMessage;

            switch (message_data.type) {
                case "lobby_data":
                    $room_data = message_data.data;
                    // console.log($room_data);
                    break;
                case "user_connect":
                    console.log("user connect", message_data.data);
                    // TODO: FIXME its temporary and ugly
                    toast.push(`User "${$room_data!.clients.find(c => c.id == parseInt(message_data.data))?.username ?? "id: " + message_data.data}" joined the room!`)
                    break;
                case "user_disconnect":
                    console.log("user disconnect", message_data.data);
                    // TODO: FIXME its temporary and ugly
                    toast.push(`User "${$room_data!.clients.find(c => c.id == parseInt(message_data.data))?.username ?? "id: " + message_data.data}" left the room!`)
                    break;
                case "spotify_data":
                    $spotify_data = message_data.data;
                    console.log($spotify_data);

                    if ($spotify_data?.playback_state != null) {
                        if (Math.abs($spotify_data?.playback_state?.progress_ms - song_progress_ms) > 1000) {
                            song_progress_ms = $spotify_data!.playback_state!.progress_ms;
                        }

                        volume = $spotify_data.playback_state.device_volume;
                    }
                    break;
                case "search_result":
                    search_results = message_data.data || [];
                    break;
                case "add_to_queue":
                    toast.push(`Track ${message_data.data} added to the owner's queue`);
                    break;
                case "set_volume":
                    toast.push(`Volume changed to ${message_data.data}%`);
                    break;
                case "play_resume":
                    toast.push("Track resumed");
                    $spotify_data!.playback_state!.is_playing = true;
                    break;
                case "pause":
                    toast.push("Track paused");
                    $spotify_data!.playback_state!.is_playing = false;
                    break;
                case "error":
                    console.error("ERROR on WS message: ", message_data.data);
                    break;
                default:
                    console.error("Unhandled case on WS message. Data:", message_data);
            }
        } catch (e) {
            console.error("Cannot parse WS message data", e, message.data);
        }
	}

	async function on_ws_error(e: Error) {
		console.error("Unable to connect to server WebSocket, redirecting...", e);
		await goto("/");
	}

	function get_party_link() {
		return `${location.origin}/join/${$room_data!.id}/${$room_data!.password}`;
	}

	async function copy_party_link() {
        await WriteToClipboard(
            get_party_link(),
            () => { toast.push("Party link copied successfully to your clipboard !"); },
            error => {
                console.error(
                    "Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
                    error,
                );
                toast.push(
                    "Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
                );
            }
        );
	}

	async function leave_room() {
        leaving = true;

		const { party_id: id, client_id } = {
            party_id: GetStorageValue("current_room")?.id ?? null,
            client_id: GetStorageValue("user")?.id ?? null
        };
		if (id != null && client_id != null && $client != null) {
			const result = await $client.mutate({ mutation: LEAVE_PARTY, variables: { id, client_id } });
			if ((result.data && result.data.leaveParty != null) || result.errors) {
				console.error("Error on leaving party", result.data, result.errors);
			}
		}

		SetStorageValue({ current_room: null, user: null });
		await goto("/");
	}

    function seek_debounce(value: number, delay: number = 400) {
        _seek_debounce != null && clearTimeout(_seek_debounce);
        _seek_debounce = setTimeout(() => {
            song_progress_ms = value;

            if (song_progress_ms != -1 && song_progress_ms != $spotify_data?.playback_state?.progress_ms) {
                $ws?.send(JSON.stringify({ "type": "seek_to_pos", "data": song_progress_ms }));
            }
        }, delay);
    }

    function search_debounce(value: string, delay: number = 500) {
        _search_debounce != null && clearTimeout(_search_debounce);
        _search_debounce = setTimeout(() => {
            search_input = value;
        }, delay);
    }

    function volume_debounce(value: number, delay: number = 400) {
        _volume_debounce != null && clearTimeout(_volume_debounce);
        _volume_debounce = setTimeout(() => {
            volume = value;
        }, delay);
    }

    async function add_track_to_queue(track_id: SpotifyTrack["track_id"], track_name: SpotifyTrack["track_name"] = "") {
        search_input = "";

        const user = GetStorageValue("user");

        if (user == null) {
            toast.push("Unexpected error: Unable to get your user data on local storage, please try again");
            return await leave_room();
        }

        if ($ws == null) {
            toast.push("Unexpected error: WS is not connected");
            return await leave_room();
        }

        $ws.send(JSON.stringify({
            "type": "add_to_queue",
            "data": { track_id, track_name }
        }));
    }

    async function add_track_to_queue_by_track(track: SpotifyTrack) {
        return await add_track_to_queue(track.track_id, track.track_name);
    }

    async function add_track_to_queue_by_id(uri_url: string) {
        const result = get_track_id_by_uri_url(uri_url);

        console.log(uri_url, result);

        if (result == null) {
            toast.push("Error: Cannot parse URL/Spotify URI to track ID");
            return;
        }

        return await add_track_to_queue(result);
    }

    function get_track_id_by_uri_url(s: string): string | null {
        if (s.startsWith("spotify")) {
            return s.split(':').pop() ?? null;
        }

        return s.split('/').pop()?.split('?').shift() ?? null;
    }

    function play_resume() {
        $ws?.send(JSON.stringify({ "type": "play_resume", "data": "" }));
    }

    function pause() {
        $ws?.send(JSON.stringify({ "type": "pause", "data": "" }));
    }

    function skip_next() {
        $ws?.send(JSON.stringify({ "type": "skip_next", "data": "" }));
    }

    function skip_previous() {
        $ws?.send(JSON.stringify({ "type": "skip_previous", "data": "" }));
    }

    $: if (search_input.trim() != "") {
        $ws?.send(JSON.stringify({ "type": "search", "data": search_input }));
    }

    $: if (volume != -1 && volume != $spotify_data?.playback_state?.device_volume) {
        $ws?.send(JSON.stringify({ "type": "set_volume", "data": volume }));
    }
</script>

<section>
	{#if leaving || $ws != null && $ws.readyState != $ws.OPEN}
		<div class="loading">
            {#if leaving}
                <span class="main-color">Leaving the party...</span>
            {:else}
                <span class="main-color">Connecting to server...</span>
            {/if}
			<Button disabled>
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				Please wait
			</Button>
		</div>
	{:else}
		<div>
			<header>
                <CustomButton
                    class_extended="xl:text-base text-red-500 font-montserrat border-red-500 hover:shadow-red-500 border-[2px]"
                    on:click={leave_room}>Leave the room</CustomButton>
				{#if show_link}
					<div>
						<Input readonly value={get_party_link()} />
                        <Button class="eye" title="Hide link" on:click={() => (show_link = false)}>
                            <EyeOff class="stroke-main-content hover:cursor-pointer" />
                        </Button>
					</div>
				{:else}
					<div>
                        <Button on:click={copy_party_link}>
                            {"Copy party link "}
                            <Link class="w-5 ml-2 stroke-main-content hover:cursor-pointer" />
                        </Button>
                        <Button class="eye" title="Show link" on:click={() => (show_link = true)}>
                            <Eye class="stroke-main-content hover:cursor-pointer" />
                        </Button>
					</div>
				{/if}
			</header>
            {#if !$spotify_data}
                <div class="player_container">
                    <h1 class="text-2xl font-bold">Retrieving data from server...</h1>
                    <div class="loader"></div>
                </div>
            {:else}
                {#if $spotify_data?.playback_state == null}
                    <div class="player_container">
                        <h1 class="text-2xl font-bold">It looks like your Spotify isn't playing anything.</h1>
                        <h1 class="text-xl font-bold">Please use Spotify to play a song and wait a bit !</h1>
                    </div>
                {:else}
                    <div class="player_container">
                        <div class="currently_playing">
                            <img src={$spotify_data.playback_state.album_image_src} alt="album cover" />
                            <div class="track">
                                <span class="main-color text-xl">{$spotify_data.playback_state.track_name}</span>
                                <span class="main-color text-lg">{$spotify_data.playback_state.artist_name}</span>
                            </div>
                            <div class="spotify_links">
                                <a href={`https://open.spotify.com/track/${$spotify_data.playback_state.track_id}`} target="_blank">
                                    <CustomButton class_extended="xl:text-sm">Spotify link</CustomButton>
                                </a>
                                <CustomButton
                                    title="Copy Spotify URI to clipboard"
                                    on:click={() => WriteToClipboard(`spotify:track:${$spotify_data?.playback_state?.track_id}`, () => {toast.push("Spotify URI copied to clipboard!")}, console.error)}
                                    class_extended="xl:text-sm"
                                >Spotify uri</CustomButton>
                            </div>
                        </div>
                        <span class="main-color italic">{FormatTime(song_progress_ms, $spotify_data.playback_state.duration_ms)}</span>
                        <input
                            class="cursor-grab accent-main-color w-2/4"
                            min={0}
                            max={$spotify_data.playback_state.duration_ms}
                            value={song_progress_ms}
                            on:change={e => seek_debounce(parseInt(e.currentTarget.value))}
                            type="range" />
                        <div class="player_controls">
                            <Button
                                class="round"
                                title="Skip back to previous track"
                                on:click={skip_previous}><SkipBack /></Button>
                            <Button
                                class="round"
                                title="Play/Pause the currently playing track"
                                on:click={() => $spotify_data?.playback_state?.is_playing ? pause() : play_resume() }>
                                {#if $spotify_data.playback_state.is_playing}
                                    <Pause />
                                {:else}
                                    <Play />
                                {/if}
                            </Button>
                            <Button
                                class="round"
                                title="Skip to next track"
                                on:click={skip_next}><SkipForward /></Button>
                            <Button
                                class="round"
                                title="Toggle volume slider"
                                on:click={() => show_volume = !show_volume}><!-- TODO: Handle scroll up/down to set volume -->
                                {#if volume >= 50}
                                    <Volume2 />
                                {:else if volume == 0}
                                    <VolumeX />
                                {:else}
                                    <Volume1 />
                                {/if}
                            </Button>
                            {#if show_volume}
                                <input
                                    class="cursor-grab accent-main-color w-2/6"
                                    min={0}
                                    max={100}
                                    value={$spotify_data.playback_state.device_volume}
                                    on:change={e => volume_debounce(parseInt(e.currentTarget.value))}
                                    title="change volume"
                                    type="range" />
                            {/if}
                        </div>
                        <div class="bg-main-color w-full h-[2px] rounded-full"></div>
                    </div>
                    <div class="bottom_container">
                        <div class="left_wrapper">
                            <div class="search_input_wrapper">
                                <Input
                                    class="bg-main-content"
                                    title="Example: spotify:track:4PTG3Z6ehGkBFwjybzWkR8 or https://open.spotify.com/..."
                                    placeholder="Add a song by Spotify URI"
                                    bind:value={url_uri_input} />
                                <Button
                                    class="font-montserrat text-base text-main-content bg-main-color-hover hover:bg-main-color-hover hover:scale-95"
                                    title="Add song to the owner's queue"
                                    on:click={() => add_track_to_queue_by_id(url_uri_input)}>Add</Button>
                            </div>
                            <!-- TODO: Clear the input on search -->
                            <Input class="bg-main-content" placeholder="Search a song by name" on:input={e => search_debounce(e.currentTarget.value)} />
                        </div>
                        <div class="prev_next_songs">
                            <div class="track_list">
                                <p class="main-color">Previous songs</p>
                                {#each $spotify_data.recent_tracks.filter((_, i) => i < 5) as track}
                                    <span>{track.track_name} - {track.artist_name}</span>
                                {/each}
                            </div>
                            <div class="track_list">
                                <p class="main-color">Next songs</p>
                                {#each zip_iter($room_data?.tracks_queue ?? [], $spotify_data.next_tracks.filter((_, i) => i < 5)) as [party_track, track]}
                                    {#if track != null} <!-- Useless condition check because it cannot be null but it satisfies the compiler/lsp -->
                                        <span>{track.track_name} - {track.artist_name}{party_track?.track_id == track?.track_id ? ` (${party_track?.username})` : ""}</span>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    </div>
                    {#if search_input.trim() != "" && search_results.length != 0}
                        <div class="results_wrapper">
                            <div class="bg-main-color w-6/12 h-[2px] rounded-full"></div>
                            <div class="search_results">
                                {#each search_results as track}
                                    <Button
                                        class="font-montserrat text-base text-main-content bg-main-color-hover hover:bg-main-color-hover hover:scale-95"
                                        on:click={() => add_track_to_queue_by_track(track)}
                                    >{track.track_name} - {track.artist_name}</Button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/if}
            {/if}
		</div>
	{/if}
</section>

<style lang="postcss">
	section {
		@apply relative z-10 w-full h-full min-h-screen flex flex-col justify-center items-center;

        input, p:not(.main-color), span:not(.main-color) {
            @apply text-main-content;
        }

		.loading {
			@apply w-2/12 flex flex-col justify-center items-center gap-8;

			span {
				@apply text-center text-xl font-bold;
			}
		}

		> div {
			@apply m-auto w-full h-[80%];

			> header {
				@apply absolute top-16 right-0 w-auto float-right flex flex-row gap-4 justify-center items-end p-4;

				> div {
					@apply w-auto flex flex-row gap-4 justify-center items-center;
				}

                > :last-child {
                    :global(> button) {
                        @apply font-montserrat text-base text-main-content bg-main-color-hover;
                        display: block ruby; /* needed to align text & svg on "a" tag */
                    }

                    :global(> input) {
                        @apply font-montserrat text-base text-main-content bg-main-color-hover border-none outline-none w-[25rem];
                    }

                    :global(> button:not(.eye)) {
                        @apply rounded-full;
                    }
                }
			}

            .player_container {
                @apply m-auto h-full w-6/12 flex flex-col justify-center items-center gap-4 font-content font-semibold;

                .currently_playing {
                    @apply relative w-full flex flex-row justify-center items-center gap-6;

                    img {
                        @apply absolute left-0 top-0 w-28 h-28;
                    }

                    .track {
                        @apply flex flex-col justify-center items-center gap-2 text-center;
                    }

                    .spotify_links {
                        @apply absolute right-0 top-0 flex flex-col justify-center items-center gap-4;
                    }
                }
            }

            .bottom_container {
                @apply m-auto mt-6 w-9/12 flex flex-row justify-center items-center;

                .left_wrapper {
                    @apply flex flex-col justify-start items-center gap-4 w-3/12;

                    .search_input_wrapper {
                        @apply flex flex-row justify-center items-center gap-4 w-full;
                    }
                }

                .prev_next_songs {
                    @apply flex flex-row justify-center items-start gap-8 w-9/12;

                    .track_list {
                        @apply flex flex-col justify-center items-center gap-2 w-4/12 text-center;

                        p {
                            @apply font-semibold text-lg;
                        }
                    }
                }
            }

            .results_wrapper {
                @apply mt-6 m-auto w-full flex flex-col justify-center items-center;

                .search_results {
                    @apply mt-4 w-9/12 flex flex-row justify-center items-start gap-4 flex-wrap;
                }
            }

            .player_controls {
                @apply flex flex-row justify-center items-center gap-4;

                :global(.round) {
                    @apply rounded-full bg-transparent border border-main-color m-0 p-0 w-10 h-10 hover:bg-main-color-hover hover:border-none transition-all duration-300;
                }
            }
		}
	}
</style>
