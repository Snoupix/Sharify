<script lang="ts">
	import websocket from "websocket";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { getContext, hasContext, onDestroy, onMount } from "svelte";
	import type { Writable } from "svelte/store";
	import {
		Circle,
		Crown,
		Eye,
		EyeOff,
		Link,
		LoaderCircle,
		Swords,
		User,
		Volume1,
		Volume2,
		VolumeX,
	} from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import * as uuid from "uuid";
	import { Tabs } from "bits-ui";

	import { ws, init_ws } from "$/lib/ws_store";
	import { send_ws_command } from "$/lib/ws_impl";
    import StateControls from "$/components/state-controls.svelte";
	import CustomButton from "$/components/button.svelte";
	import Card from "$/components/card.svelte";
	import {
		are_objects_equal,
		bytes_to_uuid_str,
		format_time,
		get_storage_value,
		set_storage_value,
		write_to_clipboard,
		zip_iter,
	} from "$/lib/utils";
	import { Command, CommandResponse } from "$/lib/proto/cmd";
	import { RoomError, type Room, type RoomUser } from "$lib/proto/room";
	import type { Track } from "$lib/proto/spotify";
	import { Role } from "$/lib/proto/role";
	import type { Nullable, SpotifyData } from "$/lib/types";

    if (!hasContext("RoomData")) {
        throw new Error("Unexpected error: Unable to get room data context, please contact Snoupix");
    }

    if (!hasContext("SpotifyData")) {
        throw new Error("Unexpected error: Unable to get spotify data context, please contact Snoupix");
    }

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");
	const spotify_data: Writable<Nullable<SpotifyData>> = getContext("SpotifyData");

    let ws_conn_tries = $state(0);
    let is_ws_connected = $derived($ws !== null && $ws.readyState === websocket.w3cwebsocket.OPEN);
    let _search_debounce: NodeJS.Timeout | null = $state(null);
	let leaving = $state(false);
	let show_link = $state(false);
	let song_progress_ms = $state(-1);
	let song_loop: NodeJS.Timeout | null = $state(null);
    let volume = $state(-1);
	let search_input = $state("");
	let search_results: Array<Track> = $state([]);
	let url_uri_input = $state("");
	let current_user: RoomUser | null = $state(null);

	onMount(async () => {
        await connect_to_ws();

		song_loop = setInterval(() => {
			if (
				$spotify_data == null ||
				$spotify_data.playback_state == null ||
				$spotify_data.playback_state.isPlaying == false ||
				song_progress_ms >= $spotify_data.playback_state.durationMs
			)
				return;

			song_progress_ms += 1000;
		}, 1000);

		current_user = get_storage_value("user");
	});

	onDestroy(() => {
		$ws?.close();
        $ws = null;

		if (song_loop !== null) {
			clearInterval(song_loop);
		}

		$spotify_data = null;
	});

    async function connect_to_ws() {
        if (leaving || is_ws_connected) {
            return;
        }

		const pathname_split = page.url.pathname.split("/");

		if (pathname_split.length != 3) {
			toast("Error: Bad pathname", { duration: 2500 });
			return await goto("/");
		}

		const path_room_id = pathname_split[pathname_split.length - 1];
		const user_id = get_storage_value("user_id");

		if (user_id == null) {
			toast("Unexpected error: You're not logged in", { duration: 2500 });
			return await goto("/");
		}

		let room_id;
		try {
			room_id = uuid.parse(path_room_id);
		} catch {
			toast("Unexpected error: Malformated Room UUID", { duration: 2500 });
			return await goto("/");
		}

		init_ws(room_id, user_id, () => undefined, on_ws_close, on_ws_error, on_ws_message);
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

                switch (key) {
                    case "room":
                        $room_data = cmd.room ?? null;
                        // console.log($room_data);
                        if (current_user !== null && $room_data !== null) {
                            const user = $room_data.users.find((u) => u.id == current_user!.id)!;

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
                            playback_state: cmd.spotifyPlaybackState?.state ?? null,
                            recent_tracks: cmd.spotifyPlaybackState?.previousTracks?.tracks ?? [],
                            next_tracks: cmd.spotifyPlaybackState?.nextTracks?.tracks ?? [],
                        };
                        console.log($spotify_data);

                        if ($spotify_data?.playback_state?.progressMs) {
                            if (Math.abs($spotify_data.playback_state.progressMs - song_progress_ms) > 1000) {
                                song_progress_ms = $spotify_data.playback_state.progressMs;
                            }
                        }

                        volume = $spotify_data?.playback_state?.deviceVolume ?? volume;
                        break;
                    case "spotifySearchResult":
                        search_results = cmd.spotifySearchResult?.tracks ?? [];
                        break;
                    case "kick":
                        toast(`You have been kicked out of the room. Reason: ${cmd.kick?.reason}`);
                        _leave_room();
                        break;
                    case "ban":
                        toast(`You have been banned from the room. Reason: ${cmd.ban?.reason}`);
                        _leave_room();
                        break;
                    case "roomError": {
                        let error_msg = "";

                        switch (cmd.roomError) {
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
                                // TODO goto("/") ?
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
                                console.error(`Unhandled case on WS RoomError CommandResponse "${key}": ${JSON.stringify(cmd)}`);
                            break;
                        }

                        if (error_msg.length !== 0) {
                            toast.error(error_msg);
                        }

                        break;
                    }
                    case "genericError":
                        console.error("Error on WS CommandResponse: ", cmd.genericError);
                        toast.error(`Server error on WS Command ${cmd.genericError}`);

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

	async function on_ws_error(e: Error) {
		console.error("Unable to connect to server WebSocket, redirecting...", e);
		await goto("/");
	}

    async function on_ws_close(close_event: websocket.ICloseEvent) {
        console.log("[DEBUG WS] Closed", close_event);

        if (ws_conn_tries >= 2) {
            return await on_ws_error(new Error("Failed to connect to server Websocket after 3 tries"));
        }

		await connect_to_ws();

        ws_conn_tries += 1;
    }

	function get_party_link() {
		return `${location.origin}/join/${bytes_to_uuid_str($room_data!.id)}/${$room_data!.password}`;
	}

	async function copy_party_link() {
		await write_to_clipboard(
			get_party_link(),
			() => {
				toast("Party link copied successfully to your clipboard !");
			},
			(error) => {
				console.error(
					"Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
					error,
				);
				toast.error(
					"Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
				);
			},
		);
	}

	async function leave_room() {
		leaving = true;

		const { room_id, user_id } = {
			room_id: get_storage_value("current_room")?.id ?? null,
			user_id: get_storage_value("user_id"),
		};
		if (room_id !== null && user_id !== null && $ws !== null) {
            send_ws_command({ leaveRoom: false }, on_cmd_send_error);
		}

		await _leave_room();
	}

	async function _leave_room() {
		set_storage_value({ current_room: null, user: null });
		await goto("/");
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

	function search_debounce(value: string, delay: number = 600) {
		if (_search_debounce !== null) {
			clearTimeout(_search_debounce);
		}

		_search_debounce = setTimeout(() => {
			search_input = value;
		}, delay);
	}

	async function add_track_to_queue(track_id: Track["trackId"]) {
		search_input = "";

		const user = get_storage_value("user");

		if (user == null) {
			toast("Unexpected error: Unable to get your user data on local storage, please try again");
			return await leave_room();
		}

        send_ws_command({ addToQueue: { trackId: track_id }}, on_cmd_send_error);

        toast(`Track added to the owner's queue`);
	}

	async function add_track_to_queue_by_track(track: Track) {
		return await add_track_to_queue(track.trackId);
	}

	async function add_track_to_queue_by_id(uri_url: string) {
		const result = get_track_id_by_uri_url(uri_url);

		console.log(uri_url, result);

		if (result == null) {
			toast("Error: Cannot parse URL/Spotify URI to track ID");
			return;
		}

		return await add_track_to_queue(result);
	}

	function get_track_id_by_uri_url(s: string): string | null {
		if (s.startsWith("spotify")) {
			return s.split(":").pop() || null;
		}

		return s.split("/").pop()?.split("?").shift() || null;
	}

	async function kick_user(u: RoomUser) {
		await send_ws_command({
            kick: {
                userId: u.id,
                reason: "Unknown",
            }
        }, on_cmd_send_error);

        toast("User kicked out of the room");
	}

	async function ban_user(u: RoomUser) {
		await send_ws_command({
            ban: {
                userId: u.id,
                reason: "Unknown",
            }
        }, on_cmd_send_error);

        toast("User banned from the room");
	}

    async function on_cmd_send_error() {
        toast("Unexpected error: WS is not connected");
        return await leave_room();
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

    $inspect(is_ws_connected)
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
				<span class="main-color">Leaving the party...</span>
			{:else}
				<span class="main-color">Connecting to server...</span>
			{/if}
			<CustomButton disabled={true}>
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				Please wait
			</CustomButton>
		</div>
	{:else}
		<div>
			<!-- TODO MOVE THIS TO NAVBAR ? <header>
				<CustomButton
					class_extended="xl:text-base text-red-500 font-montserrat border-red-500 hover:shadow-red-500 border-2"
					onclick={leave_room}>
					{#if current_user && get_user_role(current_user?.id)?.permissions?.canManageRoom}
						Close the room
					{:else}
						Leave the room
					{/if}
				</CustomButton>
				{#if show_link}
					<div>
						<input readonly value={get_party_link()} />
						<CustomButton
							class_extended="eye rounded-3xl!"
							title="Hide link"
							onclick={() => (show_link = false)}>
							<EyeOff class="stroke-main-content hover:cursor-pointer" />
						</CustomButton>
					</div>
				{:else}
					<div>
						<CustomButton onclick={copy_party_link}>
							{"Copy party link "}
							<Link class="ml-2 w-5 stroke-main-content hover:cursor-pointer" />
						</CustomButton>
						<CustomButton
							class_extended="eye rounded-3xl!"
							title="Show link"
							onclick={() => (show_link = true)}>
							<Eye class="stroke-main-content hover:cursor-pointer" />
						</CustomButton>
					</div>
				{/if}
			</header> -->
            <!-- handle spotify data null
			#if $spotify_data === null}
				TODO: Instead of waiting for server WS data, load a https://www.shadcn-svelte.com/docs/components/skeleton and maybe a toast ?
				<div class="player_container">
					<h1 class="text-2xl font-bold">Retrieving data from server...</h1>
					<div class="loader"></div>
				</div>
			:else if $spotify_data.playback_state === null}
				<div class="player_container">
					<h1 class="text-2xl font-bold">It looks like your Spotify isn't playing anything.</h1>
					<h1 class="text-xl font-bold">Please use Spotify to play a song and wait a bit !</h1>
				</div>
			:else} -->
                <!-- Layout wrapper -->
                <div class="layout-wrapper">
                    <div>
                        <!-- <div class="x controls">Controls</div> -->
                        <StateControls
                            is_skeleton={$spotify_data === null}
                            spotify_data={$spotify_data!}
                            room_data={$room_data!}
                            current_user={current_user!}
                            {volume}
                            set_volume={(percentage) => volume = percentage}
                            {song_progress_ms}
                            set_song_progress_ms={(progress) => song_progress_ms = progress}
                            {on_cmd_send_error}
                        />
                        <div class="x queue">son queue / song history</div>
                    </div>
                    <div>
                        <div class="x track-search">track search</div>
                        <div class="x member-list">member list</div>
                    </div>
                </div>
			<!-- {/if} -->
		</div>
	{/if}
</section>

<style lang="postcss">
    @reference "$/app.css";

    .layout-wrapper {
        @apply w-full h-[calc(100vh-90px)] flex flex-row items-stretch justify-stretch gap-4 p-6;

        > :first-child {
            @apply w-9/12;
        }

        > :last-child {
            @apply w-3/12;
        }

        > * {
            @apply flex flex-col gap-4;

            > * {
                @apply rounded-xl;
            }

            > :first-child {
                @apply h-7/12;
            }

            > :last-child {
                @apply h-5/12;
            }

            > :first-child {
                @apply h-3/12;
            }

            > :last-child {
                @apply h-9/12;
            }
        }
    }

    .x {
        @apply flex items-center justify-center text-center border border-secondary;
    }
</style>
