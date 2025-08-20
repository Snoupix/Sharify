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
		Pause,
		Play,
		SkipBack,
		SkipForward,
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
	import type { Room, RoomUser } from "$lib/proto/room";
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
	let _seek_debounce: NodeJS.Timeout | null = $state(null);
	let _search_debounce: NodeJS.Timeout | null = $state(null);
	let _volume_debounce: NodeJS.Timeout | null = $state(null);
	let leaving = $state(false);
	let show_link = $state(false);
	let song_progress_ms = $state(-1);
	let song_loop: NodeJS.Timeout | null = $state(null);
	let search_input = $state("");
	let search_results: Array<Track> = $state([]);
	let volume = $state(-1);
	let show_volume = $state(false);
	let url_uri_input = $state("");
	let current_user: RoomUser | null = $state(null);

	function get_user_role(user_id: RoomUser["id"]): Nullable<Role> {
		if (!user_id) return null;

        const sum_arr = (arr: Uint8Array<ArrayBufferLike>) => arr.reduce((acc, byte) => acc + byte, 0);

		return $room_data?.roleManager?.roles.find((r) => {
            if (typeof r?.id?.reduce !== "function" || typeof current_user?.roleId?.reduce !== "function") {
                return false;
            }

            return sum_arr(r.id) === sum_arr(current_user!.roleId);
        }) ?? null;
	}

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

    async function on_ws_close() {
        console.log("[DEBUG WS] Closed");

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
            send_ws_command({ leaveRoom: false });
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

	function seek_debounce(value: number, delay: number = 400) {
		if (_seek_debounce !== null) {
			clearTimeout(_seek_debounce);
		}

		_seek_debounce = setTimeout(async () => {
			song_progress_ms = value;

			if (song_progress_ms !== -1 && song_progress_ms !== $spotify_data?.playback_state?.progressMs) {
                await send_ws_command({ seekToPos: song_progress_ms });

                $spotify_data!.playback_state!.progressMs = song_progress_ms;
			}
		}, delay);
	}

	function search_debounce(value: string, delay: number = 600) {
		if (_search_debounce !== null) {
			clearTimeout(_search_debounce);
		}

		_search_debounce = setTimeout(() => {
			search_input = value;
		}, delay);
	}

	function volume_debounce(value: number, delay: number = 400) {
		if (_volume_debounce !== null) {
			clearTimeout(_volume_debounce);
		}

		_volume_debounce = setTimeout(() => {
			volume = value;
		}, delay);
	}

	async function add_track_to_queue(track_id: Track["trackId"]) {
		search_input = "";

		const user = get_storage_value("user");

		if (user == null) {
			toast("Unexpected error: Unable to get your user data on local storage, please try again");
			return await leave_room();
		}

        send_ws_command({ addToQueue: { trackId: track_id }});

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

	async function play_resume() {
		await send_ws_command({ playResume: false });

        toast("Track resumed");
        $spotify_data!.playback_state!.isPlaying = true;
	}

	async function pause() {
		await send_ws_command({ pause: false });

        toast("Track paused");
        $spotify_data!.playback_state!.isPlaying = false;
	}

	async function skip_next() {
		await send_ws_command({ skipNext: false });
	}

	async function skip_previous() {
		await send_ws_command({ skipPrevious: false });
	}

	async function kick_user(u: RoomUser) {
		await send_ws_command({
            kick: {
                userId: u.id,
                reason: "Unknown",
            }
        });

        toast("User kicked out of the room");
	}

	async function ban_user(u: RoomUser) {
		await send_ws_command({
            ban: {
                userId: u.id,
                reason: "Unknown",
            }
        });

        toast("User banned from the room");
	}

    async function send_ws_command(command: Command) {
        console.log(`[DEBUG WS]: Sending ${Object.keys(command).filter(k => !!k)[0]} Command`);

		if ($ws == null) {
			toast("Unexpected error: WS is not connected");
			return await leave_room();
		}

		const bytes = Command.encode(command).finish();

		$ws?.send(bytes);
    }

	$effect(() => {
		if (search_input.trim() !== "") {
            send_ws_command({ search: search_input });
		}
	});

	$effect(() => {
		if (volume !== -1 && volume !== $spotify_data?.playback_state?.deviceVolume) {
            send_ws_command({ setVolume: volume }).then(() => {
                toast(`Volume changed to ${volume}%`);
            });
		}
	});

    $inspect(is_ws_connected)
</script>

<svelte:head>
	{#if $room_data != null}
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
			<header>
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
			</header>
			{#if $spotify_data === null}
				<!-- TODO: Instead of waiting for server WS data, load a https://www.shadcn-svelte.com/docs/components/skeleton and maybe a toast ? -->
				<div class="player_container">
					<h1 class="text-2xl font-bold">Retrieving data from server...</h1>
					<div class="loader"></div>
				</div>
			{:else if $spotify_data.playback_state === null}
				<div class="player_container">
					<h1 class="text-2xl font-bold">It looks like your Spotify isn't playing anything.</h1>
					<h1 class="text-xl font-bold">Please use Spotify to play a song and wait a bit !</h1>
				</div>
			{:else}
				<div class="player_container">
					<div class="currently_playing">
						<img src={$spotify_data.playback_state.albumImageSrc} alt="album cover" />
						<div class="track">
							<span class="main-color text-xl">{$spotify_data.playback_state.trackName}</span>
							<span class="main-color text-lg">{$spotify_data.playback_state.artistName}</span>
						</div>
						<div class="spotify_links">
							<a
								href={`https://open.spotify.com/track/${$spotify_data.playback_state.trackId}`}
								target="_blank">
								<CustomButton class_extended="xl:text-sm hover:text-main-content"
									>Spotify link</CustomButton>
							</a>
							<CustomButton
								title="Copy Spotify URI to clipboard"
								onclick={() =>
									write_to_clipboard(
										`spotify:track:${$spotify_data?.playback_state?.trackId}`,
										() => {
											toast("Spotify URI copied to clipboard!");
										},
										console.error,
									)}
								class_extended="xl:text-sm hover:text-main-content">Spotify uri</CustomButton>
						</div>
					</div>
					<span class="main-color italic"
						>{format_time(song_progress_ms, $spotify_data.playback_state.durationMs)}</span>
					{#key current_user}
						{#if current_user !== null && get_user_role(current_user?.id)?.permissions?.canUseControls}
							<input
								class="accent-main-color w-2/4 cursor-grab"
								min={0}
								max={$spotify_data.playback_state.durationMs}
								value={song_progress_ms}
								onchange={(e) => seek_debounce(parseInt(e.currentTarget.value))}
								type="range" />
							<div class="player_controls">
								<CustomButton
									class_extended="round"
									title="Skip back to previous track"
									onclick={skip_previous}><SkipBack /></CustomButton>
								<CustomButton
									class_extended="round"
									title="Play/Pause the currently playing track"
									onclick={() =>
										$spotify_data?.playback_state?.isPlaying ? pause() : play_resume()}>
									{#if $spotify_data.playback_state.isPlaying}
										<Pause />
									{:else}
										<Play />
									{/if}
								</CustomButton>
								<CustomButton class_extended="round" title="Skip to next track" onclick={skip_next}
									><SkipForward /></CustomButton>
								<CustomButton
									class_extended="round"
									title="Toggle volume slider"
									onclick={() => (show_volume = !show_volume)}
									><!-- TODO: Handle scroll up/down to set volume -->
									{#if volume >= 50}
										<Volume2 />
									{:else if volume == 0}
										<VolumeX />
									{:else}
										<Volume1 />
									{/if}
								</CustomButton>
								{#if show_volume}
									<input
										class="accent-main-color w-2/6 cursor-grab"
										min={0}
										max={100}
										value={$spotify_data.playback_state.deviceVolume}
										onchange={(e) => volume_debounce(parseInt(e.currentTarget.value))}
										title="change volume"
										type="range" />
								{/if}
							</div>
						{/if}
					{/key}
					<div class="bg-main h-[2px] w-full rounded-full"></div>
				</div>
				<Tabs.Root value="party" class="m-auto mt-6 flex flex-col items-center justify-center">
					<Tabs.List>
						<Tabs.Trigger value="party">Party buddies</Tabs.Trigger>
						<Tabs.Trigger value="spotify">Spotify data</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="party">
						<div class="bottom_container">
							<div class="clients">
								{#if $room_data != null}
									{#each $room_data.users as user (user.id)}
										<!-- TODO: Later, use <BadgeCheck /> for premium users -->
										<Card>
											<div slot="trigger" class="client">
												{#if user.isConnected}
													<Circle fill="#119302" color="#119302" class="w-4" />
												{:else}
													<Circle fill="#a20000" color="#a20000" class="w-4" />
												{/if}
												<!-- TODO: Impl a role/permission -->
												{#if get_user_role(user.id)?.permissions?.canManageRoom ?? false}
													<span title="Owner">
														<Crown class="w-4 stroke-main-content" />
													</span>
												{:else if get_user_role(user.id)?.permissions?.canManageUsers ?? false}
													<span title="Moderator">
														<Swords class="w-4 stroke-main-content" />
													</span>
												{:else}
													<span title="User">
														<User class="w-4 stroke-main-content" />
													</span>
												{/if}
												<p>{user.username}</p>
											</div>
											<div slot="content" class="client_card">
												<div>
													<span>Username:</span>
													<span>{user.username}</span>
												</div>
												<div>
													<span>Status:</span>
													<span>{user.isConnected ? "Online" : "Offline"}</span>
												</div>
												<div>
													<span>Privileges:</span>
													<span>
														{get_user_role(user.id)?.name ?? "Role not found"}
													</span>
												</div>
												<!-- TODO: Compare user role perms -->
												{#if current_user != null && user.id != current_user.id && (get_user_role(current_user.id)?.permissions?.canManageUsers ?? false)}
													<div>
														<CustomButton onclick={() => kick_user(user)}
															>Kick</CustomButton>
														<CustomButton onclick={() => ban_user(user)}
															>Ban</CustomButton>
														<!-- {#if user.privileges == Privileges.User}
                                                            <CustomButton on:click={() => promote_client(user)}
                                                                >Promote to Moderator</CustomButton>
                                                        {/if}
                                                        {#if user.privileges == Privileges.Moderator}
                                                            <CustomButton on:click={() => demote_client(user)}
                                                                >Demote to User</CustomButton>
                                                        {/if} -->
													</div>
												{/if}
											</div>
										</Card>
									{/each}
								{/if}
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="spotify">
						<div class="bottom_container">
							<div class="prev_next_songs">
								<div class="track_list">
									<p class="main-color">Previous songs</p>
									{#each $spotify_data.recent_tracks.filter((_, i) => i < 5) as track, i (i)}
										<Card>
											<span slot="trigger">{track.trackName} - {track.artistName}</span>
											<div slot="content" class="spotify_links">
												<a
													href={`https://open.spotify.com/track/${track.trackId}`}
													target="_blank">
													<CustomButton class_extended="xl:text-sm hover:text-main-content"
														>Spotify link</CustomButton>
												</a>
												<CustomButton
													title="Copy Spotify URI to clipboard"
													onclick={() =>
														write_to_clipboard(
															`spotify:track:${track.trackId}`,
															() => {
																toast("Spotify URI copied to clipboard!");
															},
															console.error,
														)}
													class_extended="xl:text-sm hover:text-main-content"
													>Spotify uri</CustomButton>
											</div>
										</Card>
									{/each}
								</div>
								<div class="search_wrapper">
									<div class="search_input_wrapper">
										<input
											class="bg-main-content"
											title="Example: spotify:track:4PTG3Z6ehGkBFwjybzWkR8 or https://open.spotify.com/..."
											placeholder="Add a song by Spotify URI"
											bind:value={url_uri_input} />
										<CustomButton
											class_extended="font-montserrat text-base text-main-content bg-main-hover hover:bg-main-hover hover:scale-95"
											title="Add song to the owner's queue"
											onclick={() => add_track_to_queue_by_id(url_uri_input)}>Add</CustomButton>
									</div>
									<!-- TODO: Clear the input on search -->
									<input
										class="bg-main-content"
										placeholder="Search a song by name"
										oninput={(e) => search_debounce(e.currentTarget.value)} />
								</div>
								<div class="track_list">
									<p class="main-color">Next songs</p>
									<!-- prettier-ignore -->
									{#each zip_iter($room_data?.tracksQueue ?? [], $spotify_data.next_tracks.filter((_, i) => i < 5)) as [party_track, track], i (i)}
                                        <!-- Useless condition check because it cannot be null but it satisfies the compiler/lsp -->
                                        {#if track != null}
                                            <Card>
                                                <span slot="trigger"
                                                    >{track.trackName} - {track.artistName}{party_track?.trackId ==
                                                    track?.trackId
                                                        ? ` (${$room_data?.users.find(user => user.id === party_track?.userId)?.username ?? "user not found"})`
                                                        : ""}</span>
                                                <div slot="content" class="spotify_links">
                                                    <a
                                                        href={`https://open.spotify.com/track/${track.trackId}`}
                                                        target="_blank">
                                                        <CustomButton class_extended="xl:text-sm hover:text-main-content"
                                                            >Spotify link</CustomButton>
                                                    </a>
                                                    <CustomButton
                                                        title="Copy Spotify URI to clipboard"
                                                        onclick={() =>
                                                            write_to_clipboard(
                                                                `spotify:track:${track.trackId}`,
                                                                () => {
                                                                    toast("Spotify URI copied to clipboard!");
                                                                },
                                                                console.error,
                                                            )}
                                                        class_extended="xl:text-sm hover:text-main-content">Spotify uri</CustomButton>
                                                </div>
                                            </Card>
                                        {/if}
                                    {/each}
								</div>
							</div>
						</div>
					</Tabs.Content>
				</Tabs.Root>
				{#if search_input.trim() != "" && search_results.length != 0}
					<div class="results_wrapper">
						<div class="bg-main h-[2px] w-6/12 rounded-full"></div>
						<div class="search_results">
							{#each search_results as track (track.trackId)}
								<CustomButton
									class_extended="font-montserrat text-base text-main-content bg-main-hover hover:bg-main-hover hover:scale-95"
									onclick={() => add_track_to_queue_by_track(track)}
									>{track.trackName} - {track.artistName}</CustomButton>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</section>

<style lang="postcss">
    @reference "$/app.css";

	section {
		@apply relative z-10 flex h-full min-h-screen w-full flex-col items-center justify-center;

		input,
		p:not(.main-color),
		span:not(.main-color) {
			@apply text-main-content;
		}

		.loading {
			@apply flex w-2/12 flex-col items-center justify-center gap-8;

			span {
				@apply text-center text-xl font-bold;
			}
		}

		> div {
			@apply m-auto h-[80%] w-full;

			> header {
				@apply absolute top-16 right-0 float-right flex w-auto flex-row items-end justify-center gap-4 p-4;

				> div {
					@apply flex w-auto flex-row items-center justify-center gap-4;
				}

				> :last-child {
					:global(> button) {
						@apply bg-secondary font-montserrat text-base text-main-content;
						display: block ruby; /* needed to align text & svg on "a" tag */
					}

					:global(> input) {
						@apply bg-main-hover w-[25rem] border-none font-montserrat text-base text-main-content outline-none;
					}

					:global(> button:not(.eye)) {
						@apply rounded-full;
					}
				}
			}

			.player_container {
				@apply m-auto flex h-full w-6/12 flex-col items-center justify-center gap-4 font-content font-bold;

				.currently_playing {
					@apply relative flex w-full flex-row items-center justify-center gap-6;

					img {
						@apply absolute top-0 left-0 h-28 w-28;
					}

					.track {
						@apply flex flex-col items-center justify-center gap-2 text-center;
					}

					.spotify_links {
						@apply absolute top-0 right-0 flex flex-col items-center justify-center gap-4;
					}
				}
			}

			.bottom_container {
				@apply m-auto mt-6 flex w-full flex-row items-center justify-center;

				.prev_next_songs {
					@apply flex w-full flex-row items-start justify-center gap-8;

					.search_wrapper {
						@apply flex w-4/12 flex-col items-center justify-start gap-4;

						.search_input_wrapper {
							@apply flex w-full flex-row items-center justify-center gap-4;
						}
					}

					.track_list {
						@apply flex w-5/12 flex-col items-center justify-center gap-2 text-center;

						p {
							@apply text-lg font-semibold;
						}
					}
				}

				.clients {
					@apply flex flex-col flex-wrap items-start justify-start gap-4;

					.client {
						@apply bg-main-hover flex flex-row items-center justify-center gap-2 rounded-full px-4 py-1;

						p {
							@apply font-content;
						}
					}
				}
			}

			.results_wrapper {
				@apply m-auto mt-6 flex w-full flex-col items-center justify-center;

				.search_results {
					@apply mt-4 flex w-9/12 flex-row flex-wrap items-start justify-center gap-4;
				}
			}

			.player_controls {
				@apply flex flex-row items-center justify-center gap-4;

				:global(.round) {
					@apply border-main hover:bg-main-hover m-0 h-10 w-10 rounded-full border bg-transparent p-0 transition-all duration-300 hover:border-none;

					:global(svg) {
						@apply transition-all duration-500;
					}

					&:hover {
						:global(svg) {
							@apply stroke-main-content;
						}
					}
				}
			}
		}
	}

	:global(.client_card) {
		> div {
			@apply flex flex-row items-center justify-between;
		}

		* {
			@apply dark:text-main-clear text-main-content;
		}
	}
</style>
