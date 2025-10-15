<script lang="ts">
	import websocket from "websocket";
	import { page } from "$app/state";
	import { getContext, hasContext, onDestroy, onMount } from "svelte";
	import type { Writable } from "svelte/store";
	import { LoaderCircle } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import * as uuid from "uuid";

	import { ws, init_ws } from "$/lib/ws_store";
	import { send_ws_command, leave_room_cmd } from "$/lib/ws_impl";
	import StateControls from "$/components/state-controls.svelte";
	import SongQueue from "$/components/song-queue.svelte";
	import TrackSearch from "$/components/track-search.svelte";
	import MemberList from "$/components/member-list.svelte";
	import CustomButton from "$/components/button.svelte";
	import {
		are_objects_equal,
		custom_promise,
		get_storage_value,
		set_storage_value,
		with_timeout,
		leave_room,
	} from "$/lib/utils";
	import { CommandResponse } from "$/lib/proto/cmd";
	import { RoomError, type Room, type RoomUser } from "$lib/proto/room";
	import type { Track } from "$lib/proto/spotify";
	import type { Nullable, SpotifyData } from "$/lib/types";

	if (!hasContext("RoomData")) {
		throw new Error("Unexpected error: Unable to get room data context, please contact Snoupix");
	}

	if (!hasContext("SpotifyData")) {
		throw new Error("Unexpected error: Unable to get spotify data context, please contact Snoupix");
	}

	const SPOTIFY_DATA_TIMEOUT_MS = 1000 * 20;

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");
	const spotify_data: Writable<Nullable<SpotifyData>> = getContext("SpotifyData");

	let ws_conn_tries = $state(0);
	let is_ws_connected = $derived($ws !== null && $ws.readyState === websocket.w3cwebsocket.OPEN);
	let data_is_ready_promise: ReturnType<typeof custom_promise> | null = $state(null);
	let leaving = $state(false);
	let song_progress_ms = $state(-1);
	let song_loop: NodeJS.Timeout | null = $state(null);
	let volume = $state(-1);
	let search_input = $state("");
	let search_results: Array<Track> = $state([]);
	let current_user: RoomUser | null = $state(null);

	onMount(async () => {
		(window?.document ?? document)?.addEventListener("keydown", keydown_listener);

		data_is_ready_promise = custom_promise();

		toast.promise(
			with_timeout(
				data_is_ready_promise.promise,
				"Timeout: Server didn't responded in time, try again later.",
				SPOTIFY_DATA_TIMEOUT_MS,
			),
			{
				duration: 10 * 1000,
				loading: "Waiting for server data...",
				success: "Room loaded, have fun",
				error: (error) => {
					if (typeof error === "string" && (error.startsWith("Timeout") || error.startsWith("Dismissed"))) {
						leave_room();
						return error;
					}

					return error as string;
				},
			},
		);

		await connect_to_ws();

		song_loop = setInterval(() => {
			if (
				$spotify_data === null ||
				$spotify_data.playback_state === null ||
				$spotify_data.playback_state.isPlaying === false ||
				song_progress_ms >= $spotify_data.playback_state.durationMs
			)
				return;

			song_progress_ms += 1000;
		}, 1000);

		current_user = get_storage_value("user");
	});

	onDestroy(() => {
		(window?.document ?? document)?.removeEventListener("keydown", keydown_listener);

		$ws?.close();
		$ws = null;

		if (song_loop !== null) {
			clearInterval(song_loop);
		}

		$spotify_data = null;
	});

	function keydown_listener(event: KeyboardEvent) {
		if (event.key === "Escape") {
			if (data_is_ready_promise === null) {
				return;
			}

			data_is_ready_promise.reject_ref("Dissmissed");
			leave_room();
		}
	}

	async function connect_to_ws() {
		if (leaving || is_ws_connected) {
			return;
		}

		const pathname_split = page.url.pathname.split("/");

		if (pathname_split.length !== 3) {
			return await leave_room();
		}

		const path_room_id = pathname_split[pathname_split.length - 1];
		const user_id = get_storage_value("user_id");

		if (user_id === null) {
			toast("Unexpected error: You're not logged in", { duration: 2500 });
			return await leave_room();
		}

		let room_id;
		try {
			room_id = uuid.parse(path_room_id);
		} catch {
			toast("Unexpected error: Malformated Room UUID", { duration: 2500 });
			return await leave_room();
		}

		init_ws(room_id, user_id, () => undefined, on_ws_close, on_ws_error, on_ws_message);
	}

	async function on_ws_error(e: Error) {
		console.error("Unable to connect to server WebSocket, redirecting...", e);
		return await leave_room();
	}

	async function on_ws_close(close_event: websocket.ICloseEvent) {
		console.log("[DEBUG WS] Closed", close_event);

		if (close_event.reason?.length !== 0) {
			if (data_is_ready_promise !== null) {
				data_is_ready_promise.reject_ref(close_event.reason);
			} else {
				toast.error(close_event.reason);
			}

			return await leave_room();
		}

		if (ws_conn_tries >= 2) {
			return await on_ws_error(new Error("Failed to connect to server Websocket after 3 tries"));
		}

		await connect_to_ws();

		ws_conn_tries += 1;
	}

	async function on_ws_message({ data }: websocket.IMessageEvent) {
		try {
			let bytes = data as Uint8Array<ArrayBufferLike>;

			if (data instanceof Blob) {
				bytes = await data.bytes();
			}

			const cmd = CommandResponse.decode(bytes);

			for (const key of Object.keys(cmd) as Array<keyof CommandResponse>) {
				if (cmd[key] === undefined) continue;

				console.log(`[DEBUG WS] Command "${key}" recieved`);

				switch (key) {
					case "room":
						$room_data = cmd[key] ?? null;
						console.log($room_data);
						if (current_user !== null && $room_data !== null) {
							const user = $room_data.users.find((u) => u.id == current_user!.id)!;

							if (user === undefined) {
								console.error("Unexpected error: User not found in the room");
								return;
							}

							if (!are_objects_equal(current_user, user)) {
								current_user = user;
								set_storage_value({ user });
							}
						}

						break;
					/* case "user_connect":
                        console.log("user connect", message_data.data);
                        // TODO: FIXME its temporary and ugly
                        toast(
                            `User "${$room_data!.users.find((u) => u.id == message_data.data)?.username ?? "id: " + message_data.data}" joined the room!`,
                        );
                        break;
                    case "user_disconnect":
                        console.log("user disconnect", message_data.data);
                        // TODO: FIXME its temporary and ugly
                        toast(
                            `User "${$room_data!.users.find((u) => u.id == message_data.data)?.username ?? "id: " + message_data.data}" left the room!`,
                        );
                        break; */
					case "spotifyPlaybackState":
						$spotify_data = {
							playback_state: cmd[key]?.state ?? $spotify_data?.playback_state ?? null,
							recent_tracks: $spotify_data?.recent_tracks ?? [],
							next_tracks: $spotify_data?.next_tracks ?? [],
						};
						console.log($spotify_data);

						process_new_playback_state();
						break;
					case "spotifyTracksState":
						$spotify_data = {
							playback_state: $spotify_data?.playback_state ?? null,
							recent_tracks: cmd[key]?.previousTracks?.tracks ?? $spotify_data?.recent_tracks ?? [],
							next_tracks: cmd[key]?.nextTracks?.tracks ?? $spotify_data?.next_tracks ?? [],
						};
						console.log($spotify_data);
						break;
					case "spotifyAllState":
						// First playback recieved
						if (data_is_ready_promise !== null) {
							if (cmd[key]?.state !== undefined) {
								data_is_ready_promise.resolve_ref(null);
							} else {
								data_is_ready_promise.reject_ref(
									"It looks like your Spotify isn't playing anything. Please use Spotify to play a song and wait a bit !",
								);
							}

							data_is_ready_promise = null;
						}

						$spotify_data = {
							playback_state: cmd[key]?.state ?? $spotify_data?.playback_state ?? null,
							recent_tracks: cmd[key]?.previousTracks?.tracks ?? $spotify_data?.recent_tracks ?? [],
							next_tracks: cmd[key]?.nextTracks?.tracks ?? $spotify_data?.next_tracks ?? [],
						};
						console.log($spotify_data);

						process_new_playback_state();
						break;
					case "spotifySearchResult":
						search_results = cmd[key]?.tracks ?? [];
						break;
					case "kick":
						toast(`You have been kicked out of the room. Reason: ${cmd[key]?.reason}`);
						leave_room();
						break;
					case "ban":
						toast(`You have been banned from the room. Reason: ${cmd[key]?.reason}`);
						leave_room();
						break;
					case "roomError": {
						let error_msg = "";

						switch (cmd[key]) {
							case RoomError.ROOM_FULL:
								error_msg = "Room already full";
								break;
							case RoomError.UNREACHABLE:
								error_msg = "Unexpected server error, please try again later";
								break;
							case RoomError.USER_BANNED:
								error_msg = "You have been banned from the room";
								break;
							case RoomError.UNAUTHORIZED:
								error_msg = "You are not authorized to do that";
								break;
							case RoomError.ROLE_NOT_FOUND:
								error_msg = "Unexpected error: Role not found";
								break;
							case RoomError.ROOM_NOT_FOUND:
								error_msg = "Unexpected error: Room not found";
								await leave_room();
								break;
							case RoomError.ROOM_USER_NOT_FOUND:
								error_msg = "Room user not found";
								break;
							case RoomError.USER_ID_EXISTS:
								error_msg = "Your UserID (email) is already used in another Room";
								break;
							// Shouldn't happen client side
							case RoomError.TRACK_NOT_FOUND:
								error_msg = "Track not found";
								break;
							case RoomError.ROOM_CREATION_FAIL:
								error_msg = "Failed to create the room";
								break;
							case RoomError.UNRECOGNIZED:
							default:
								console.error(
									`Unhandled case on WS RoomError CommandResponse "${key}": ${JSON.stringify(cmd)}`,
								);
								break;
						}

						if (error_msg.length !== 0) {
							toast.error(error_msg);
						}

						break;
					}
					case "spotifyRateLimited":
						toast.warning(`Too much Spotify requests, wait ${cmd[key]}s and try again`);
						break;
					case "genericError":
						console.error("Error on WS CommandResponse: ", cmd[key]);
						toast.error(`Server error on WS Command ${cmd[key]}`);

						break;
					case "newUserJoined":
						toast(`User "${cmd[key]}" joined the room !`);
						break;
					default:
						console.error(`Unhandled case on WS CommandResponse "${key}": ${JSON.stringify(cmd)}`);
				}

				break;
			}
		} catch (e) {
			console.error("Cannot decode WS CommandReponse", e, data);
		}
	}

	/* async function promote_client(c: RoomUser) {
        const { party_id: id, client_id } = {
            party_id: get_storage_value("current_room")?.id ?? null,
            client_id: get_storage_value("user_id"),
        };
        if (id != null && client_id != null && $client != null) {
            const result = await $client.mutate({
                mutation: PROMOTE_CLIENT,
                variables: { id, client_id, target_id: c.id },
            });
            if ((result.data && result.data.promoteUser != null) || result.errors) {
                console.error("Error on promote client", result.data, result.errors);
            }
        }
    }

    async function demote_client(c: RoomUser) {
        const { party_id: id, client_id } = {
            party_id: get_storage_value("current_room")?.id ?? null,
            client_id: get_storage_value("user_id"),
        };
        if (id != null && client_id != null && $client != null) {
            const result = await $client.mutate({
                mutation: DEMOTE_CLIENT,
                variables: { id, client_id, target_id: c.id },
            });
            if ((result.data && result.data.demoteUser != null) || result.errors) {
                console.error("Error on demote client", result.data, result.errors);
            }
        }
    } */

	async function on_cmd_send_error() {
		toast("Unexpected error: WS is not connected");
		leaving = true;
		return await leave_room_cmd();
	}

	async function process_new_playback_state() {
		if ($spotify_data?.playback_state?.progressMs) {
			if (Math.abs($spotify_data.playback_state.progressMs - song_progress_ms) > 1000) {
				song_progress_ms = $spotify_data.playback_state.progressMs;
			}
		}

		volume = $spotify_data?.playback_state?.deviceVolume ?? volume;
	}

	$effect(() => {
		if (search_input.trim() !== "") {
			send_ws_command({ search: search_input }, on_cmd_send_error);
		}
	});

	$effect(() => {
		if (volume !== -1 && volume !== $spotify_data?.playback_state?.deviceVolume) {
			send_ws_command({ setVolume: volume }).then(() => {
				toast(`Volume changed to ${volume}%`);
			}, on_cmd_send_error);
		}
	});
</script>

<svelte:head>
	{#if $room_data !== null}
		<title>Sharify room: "{$room_data.name}"</title>
	{/if}
</svelte:head>

<section>
	{#if leaving || !is_ws_connected}
		<div class="loading">
			{#if leaving}
				<span>Leaving the room...</span>
			{:else}
				<span>Connecting to server...</span>
			{/if}
			<CustomButton disabled={true}>
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				Please wait
			</CustomButton>
		</div>
	{:else}
		<!-- TODO: Create a button to refetch Spotify Data when player hasn't played a song (yet) -->
		<div class="layout-wrapper">
			<div>
				<StateControls
					is_skeleton={$spotify_data === null || $spotify_data.playback_state === null}
					current_user={current_user!}
					{volume}
					set_volume={(percentage) => (volume = percentage)}
					{song_progress_ms}
					set_song_progress_ms={(progress) => (song_progress_ms = progress)}
					{on_cmd_send_error} />
				<SongQueue is_skeleton={$spotify_data === null || $spotify_data.playback_state === null} />
			</div>
			<div>
				<TrackSearch
					is_skeleton={$spotify_data === null || $spotify_data.playback_state === null}
					{search_input}
					set_search_input={(input) => (search_input = input)}
					{search_results}
					clear_search_results={() => {
						search_input = "";
						search_results = [];
					}}
					set_leaving={(b) => (leaving = b)}
					{on_cmd_send_error} />
				<MemberList
					is_skeleton={$spotify_data === null || $spotify_data.playback_state === null}
					current_user={current_user!} />
			</div>
		</div>
	{/if}
</section>

<style lang="postcss">
	@reference "$/app.css";

	.layout-wrapper {
		@apply flex h-[calc(100vh-var(--nav-h))] w-full flex-row items-stretch justify-stretch gap-4 p-6;

		/* Left col */
		> :first-child {
			@apply w-9/12;

			:global(> :first-child) {
				@apply h-7/12;
			}

			:global(> :last-child) {
				@apply h-5/12;
			}
		}

		/* Right col */
		> :last-child {
			@apply w-3/12;

			:global(> :first-child) {
				@apply h-3/12;
			}

			:global(> :last-child) {
				@apply h-9/12;
			}
		}

		> * {
			@apply flex flex-col gap-4;

			:global(> *) {
				@apply h-full w-full overflow-x-hidden overflow-y-scroll rounded-xl border border-secondary;
				@apply neon:shadow-main neon:transition-shadow neon:duration-300 neon:hover:shadow-around;
			}
		}
	}
</style>
