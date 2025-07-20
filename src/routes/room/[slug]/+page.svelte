<script lang="ts">
    import websocket from "websocket";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { getContext, hasContext, onDestroy, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
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

    import ws, { init_ws } from "$/lib/ws_store";
    import { toast } from "@zerodevx/svelte-toast";
    import { Button } from "$/components/ui/button";
    import { Input } from "$/components/ui/input";
    import * as Tabs from "$/components/ui/tabs";
    import CustomButton from "$/components/button.svelte";
    import Card from "$/components/card.svelte";
    import {
        are_objects_equal,
        format_time,
        get_storage_value,
        set_storage_value,
        write_to_clipboard,
        zip_iter,
    } from "$/lib/utils";
    import { Privileges } from "$/lib/types";
    import type { Party, PartyClient, SpotifyData, SpotifyTrack, WsMessage } from "$/lib/types";
    import { LEAVE_PARTY, DEMOTE_CLIENT, PROMOTE_CLIENT } from "$/lib/queries";

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
    let search_input = "";
    let search_results: Array<SpotifyTrack> = [];
    let volume = -1;
    let show_volume = false;
    let url_uri_input = "";
    let current_user: PartyClient | null = null;

    onMount(async () => {
        const pathname_split = $page.url.pathname.split("/");

        if (pathname_split.length != 3) {
            toast.push("Error: Bad pathname", { duration: 2500 });
            return await goto("/");
        }

        const room_id = parseInt(pathname_split[pathname_split.length - 1]);
        const client_id = get_storage_value("user_id");

        if (client_id == null) {
            toast.push("Unexpected error: You're not logged in", { duration: 2500 });
            return await goto("/");
        }

        init_ws(room_id, client_id, undefined, undefined, on_ws_error, on_ws_message);

        song_loop = setInterval(() => {
            if (
                $spotify_data == null ||
                $spotify_data.playback_state == null ||
                $spotify_data.playback_state.is_playing == false ||
                song_progress_ms >= $spotify_data.playback_state.duration_ms
            )
                return;

            song_progress_ms += 1000;
        }, 1000);

        current_user = get_storage_value("user");
    });

    onDestroy(() => {
        $ws?.close();
        song_loop && clearInterval(song_loop);
        $spotify_data = null;
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
                    if (current_user != null && $room_data != null) {
                        const user = $room_data.clients.find(c => c.id == current_user!.id)!;

                        if (!are_objects_equal(current_user, user)) {
                            current_user = user;
                            set_storage_value({ user });
                        }
                    }
                    break;
                case "user_connect":
                    console.log("user connect", message_data.data);
                    // TODO: FIXME its temporary and ugly
                    toast.push(
                        `User "${$room_data!.clients.find(c => c.id == message_data.data)?.username ?? "id: " + message_data.data}" joined the room!`,
                    );
                    break;
                case "user_disconnect":
                    console.log("user disconnect", message_data.data);
                    // TODO: FIXME its temporary and ugly
                    toast.push(
                        `User "${$room_data!.clients.find(c => c.id == message_data.data)?.username ?? "id: " + message_data.data}" left the room!`,
                    );
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
                case "seek_to_pos":
                    $spotify_data!.playback_state!.progress_ms = message_data.data;
                    break;
                case "kicked":
                    toast.push(message_data.data);
                    _leave_room();
                    break;
                case "banned":
                    toast.push(message_data.data);
                    _leave_room();
                    break;
                case "kick_client":
                    toast.push("User kicked out of the room");
                    break;
                case "ban_client":
                    toast.push("User banned from the room");
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
        await write_to_clipboard(
            get_party_link(),
            () => {
                toast.push("Party link copied successfully to your clipboard !");
            },
            error => {
                console.error(
                    "Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
                    error,
                );
                toast.push(
                    "Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
                );
            },
        );
    }

    async function leave_room() {
        leaving = true;

        const { party_id: id, client_id } = {
            party_id: get_storage_value("current_room")?.id ?? null,
            client_id: get_storage_value("user_id"),
        };
        if (id != null && client_id != null && $client != null) {
            const result = await $client.mutate({ mutation: LEAVE_PARTY, variables: { id, client_id } });
            if ((result.data && result.data.leaveParty != null) || result.errors) {
                console.error("Error on leaving party", result.data, result.errors);
            }
        }

        await _leave_room();
    }

    async function _leave_room() {
        set_storage_value({ current_room: null, user: null });
        await goto("/");
    }

    async function promote_client(c: PartyClient) {
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

    async function demote_client(c: PartyClient) {
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
    }

    function seek_debounce(value: number, delay: number = 400) {
        _seek_debounce != null && clearTimeout(_seek_debounce);
        _seek_debounce = setTimeout(() => {
            song_progress_ms = value;

            if (song_progress_ms != -1 && song_progress_ms != $spotify_data?.playback_state?.progress_ms) {
                $ws?.send(JSON.stringify({ type: "seek_to_pos", data: song_progress_ms }));
            }
        }, delay);
    }

    function search_debounce(value: string, delay: number = 600) {
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

    async function add_track_to_queue(
        track_id: SpotifyTrack["track_id"],
        track_name: SpotifyTrack["track_name"] = "",
        track_duration: SpotifyTrack["track_duration"] = 0,
    ) {
        search_input = "";

        const user = get_storage_value("user");

        if (user == null) {
            toast.push("Unexpected error: Unable to get your user data on local storage, please try again");
            return await leave_room();
        }

        if ($ws == null) {
            toast.push("Unexpected error: WS is not connected");
            return await leave_room();
        }

        $ws.send(
            JSON.stringify({
                type: "add_to_queue",
                data: { track_id, track_name, track_duration },
            }),
        );
    }

    async function add_track_to_queue_by_track(track: SpotifyTrack) {
        return await add_track_to_queue(track.track_id, track.track_name, track.track_duration);
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
            return s.split(":").pop() || null;
        }

        return s.split("/").pop()?.split("?").shift() || null;
    }

    function play_resume() {
        $ws?.send(JSON.stringify({ type: "play_resume", data: "" }));
    }

    function pause() {
        $ws?.send(JSON.stringify({ type: "pause", data: "" }));
    }

    function skip_next() {
        $ws?.send(JSON.stringify({ type: "skip_next", data: "" }));
    }

    function skip_previous() {
        $ws?.send(JSON.stringify({ type: "skip_previous", data: "" }));
    }

    function kick_client(c: PartyClient) {
        $ws?.send(JSON.stringify({ type: "kick_client", data: c.id }));
    }

    function ban_client(c: PartyClient) {
        $ws?.send(JSON.stringify({ type: "ban_client", data: c.id }));
    }

    $: if (search_input.trim() != "") {
        $ws?.send(JSON.stringify({ type: "search", data: search_input }));
    }

    $: if (volume != -1 && volume != $spotify_data?.playback_state?.device_volume) {
        $ws?.send(JSON.stringify({ type: "set_volume", data: volume }));
    }
</script>

<svelte:head>
    {#if $room_data != null}
        <title>Sharify room: "{$room_data.name}"</title>
    {/if}
</svelte:head>

<section>
    {#if leaving || ($ws != null && $ws.readyState != $ws.OPEN)}
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
                    on:click={leave_room}>
                    {#if current_user && current_user.privileges == Privileges.Owner}
                        {`Close the room`}
                    {:else}
                        {`Leave the room`}
                    {/if}
                </CustomButton>
                {#if show_link}
                    <div>
                        <Input readonly value={get_party_link()} />
                        <Button class="eye !rounded-3xl" title="Hide link" on:click={() => (show_link = false)}>
                            <EyeOff class="stroke-main-content hover:cursor-pointer" />
                        </Button>
                    </div>
                {:else}
                    <div>
                        <Button on:click={copy_party_link}>
                            {"Copy party link "}
                            <Link class="w-5 ml-2 stroke-main-content hover:cursor-pointer" />
                        </Button>
                        <Button class="eye !rounded-3xl" title="Show link" on:click={() => (show_link = true)}>
                            <Eye class="stroke-main-content hover:cursor-pointer" />
                        </Button>
                    </div>
                {/if}
            </header>
            {#if !$spotify_data}
                <!-- TODO: Instead of waiting for server WS data, load a https://www.shadcn-svelte.com/docs/components/skeleton and maybe a toast ? -->
                <div class="player_container">
                    <h1 class="text-2xl font-bold">Retrieving data from server...</h1>
                    <div class="loader"></div>
                </div>
            {:else if $spotify_data?.playback_state == null}
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
                            <a
                                href={`https://open.spotify.com/track/${$spotify_data.playback_state.track_id}`}
                                target="_blank">
                                <CustomButton class_extended="xl:text-sm hover:text-main-content"
                                    >Spotify link</CustomButton>
                            </a>
                            <CustomButton
                                title="Copy Spotify URI to clipboard"
                                on:click={() =>
                                    write_to_clipboard(
                                        `spotify:track:${$spotify_data?.playback_state?.track_id}`,
                                        () => {
                                            toast.push("Spotify URI copied to clipboard!");
                                        },
                                        console.error,
                                    )}
                                class_extended="xl:text-sm hover:text-main-content">Spotify uri</CustomButton>
                        </div>
                    </div>
                    <span class="main-color italic"
                        >{format_time(song_progress_ms, $spotify_data.playback_state.duration_ms)}</span>
                    {#key current_user}
                        {#if current_user != null && current_user.privileges >= Privileges.Moderator}
                            <input
                                class="cursor-grab accent-main-color w-2/4"
                                min={0}
                                max={$spotify_data.playback_state.duration_ms}
                                value={song_progress_ms}
                                on:change={e => seek_debounce(parseInt(e.currentTarget.value))}
                                type="range" />
                            <div class="player_controls">
                                <Button class="round" title="Skip back to previous track" on:click={skip_previous}
                                    ><SkipBack /></Button>
                                <Button
                                    class="round"
                                    title="Play/Pause the currently playing track"
                                    on:click={() =>
                                        $spotify_data?.playback_state?.is_playing ? pause() : play_resume()}>
                                    {#if $spotify_data.playback_state.is_playing}
                                        <Pause />
                                    {:else}
                                        <Play />
                                    {/if}
                                </Button>
                                <Button class="round" title="Skip to next track" on:click={skip_next}
                                    ><SkipForward /></Button>
                                <Button
                                    class="round"
                                    title="Toggle volume slider"
                                    on:click={() => (show_volume = !show_volume)}
                                    ><!-- TODO: Handle scroll up/down to set volume -->
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
                        {/if}
                    {/key}
                    <div class="bg-main-color w-full h-[2px] rounded-full"></div>
                </div>
                <Tabs.Root value="party" class="m-auto mt-6 flex flex-col justify-center items-center">
                    <Tabs.List>
                        <Tabs.Trigger value="party">Party buddies</Tabs.Trigger>
                        <Tabs.Trigger value="spotify">Spotify data</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="party">
                        <div class="bottom_container">
                            <div class="clients">
                                {#if $room_data != null}
                                    {#each $room_data.clients as client}
                                        <!-- TODO: Later, use <BadgeCheck /> for premium users -->
                                        <Card>
                                            <div slot="trigger" class="client">
                                                {#if client.is_connected}
                                                    <Circle fill="#119302" color="#119302" class="w-4" />
                                                {:else}
                                                    <Circle fill="#a20000" color="#a20000" class="w-4" />
                                                {/if}
                                                {#if client.privileges == Privileges.Owner}
                                                    <span title="Owner">
                                                        <Crown class="w-4 stroke-main-content" />
                                                    </span>
                                                {:else if client.privileges == Privileges.Moderator}
                                                    <span title="Moderator">
                                                        <Swords class="w-4 stroke-main-content" />
                                                    </span>
                                                {:else if client.privileges == Privileges.User}
                                                    <span title="User">
                                                        <User class="w-4 stroke-main-content" />
                                                    </span>
                                                {/if}
                                                <p>{client.username}</p>
                                            </div>
                                            <div slot="content" class="client_card">
                                                <div>
                                                    <span>Username:</span>
                                                    <span>{client.username}</span>
                                                </div>
                                                <div>
                                                    <span>Status:</span>
                                                    <span>{client.is_connected ? "Online" : "Offline"}</span>
                                                </div>
                                                <div>
                                                    <span>Privileges:</span>
                                                    <span>
                                                        {#if client.privileges == Privileges.Owner}
                                                            Owner
                                                        {:else if client.privileges == Privileges.Moderator}
                                                            Moderator
                                                        {:else if client.privileges == Privileges.User}
                                                            User
                                                        {/if}
                                                    </span>
                                                </div>
                                                {#if current_user != null && client.id != current_user.id && client.privileges != Privileges.Owner}
                                                    {#if current_user.privileges > client.privileges}
                                                        <div>
                                                            <Button on:click={() => kick_client(client)}>Kick</Button>
                                                            <Button on:click={() => ban_client(client)}>Ban</Button>
                                                            {#if client.privileges == Privileges.User}
                                                                <Button on:click={() => promote_client(client)}
                                                                    >Promote to Moderator</Button>
                                                            {/if}
                                                            {#if client.privileges == Privileges.Moderator}
                                                                <Button on:click={() => demote_client(client)}
                                                                    >Demote to User</Button>
                                                            {/if}
                                                        </div>
                                                    {/if}
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
                                    {#each $spotify_data.recent_tracks.filter((_, i) => i < 5) as track}
                                        <Card>
                                            <span slot="trigger">{track.track_name} - {track.artist_name}</span>
                                            <div slot="content" class="spotify_links">
                                                <a
                                                    href={`https://open.spotify.com/track/${track.track_id}`}
                                                    target="_blank">
                                                    <CustomButton class_extended="xl:text-sm hover:text-main-content"
                                                        >Spotify link</CustomButton>
                                                </a>
                                                <CustomButton
                                                    title="Copy Spotify URI to clipboard"
                                                    on:click={() =>
                                                        write_to_clipboard(
                                                            `spotify:track:${track.track_id}`,
                                                            () => {
                                                                toast.push("Spotify URI copied to clipboard!");
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
                                    <Input
                                        class="bg-main-content"
                                        placeholder="Search a song by name"
                                        on:input={e => search_debounce(e.currentTarget.value)} />
                                </div>
                                <div class="track_list">
                                    <p class="main-color">Next songs</p>
                                    <!-- prettier-ignore -->
                                    {#each zip_iter($room_data?.tracks_queue ?? [], $spotify_data.next_tracks.filter((_, i) => i < 5)) as [party_track, track]}
                                        <!-- Useless condition check because it cannot be null but it satisfies the compiler/lsp -->
                                        {#if track != null}
                                            <Card>
                                                <span slot="trigger"
                                                    >{track.track_name} - {track.artist_name}{party_track?.track_id ==
                                                    track?.track_id
                                                        ? ` (${party_track?.username})`
                                                        : ""}</span>
                                                <div slot="content" class="spotify_links">
                                                    <a
                                                        href={`https://open.spotify.com/track/${track.track_id}`}
                                                        target="_blank">
                                                        <CustomButton class_extended="xl:text-sm hover:text-main-content"
                                                            >Spotify link</CustomButton>
                                                    </a>
                                                    <CustomButton
                                                        title="Copy Spotify URI to clipboard"
                                                        on:click={() =>
                                                            write_to_clipboard(
                                                                `spotify:track:${track.track_id}`,
                                                                () => {
                                                                    toast.push("Spotify URI copied to clipboard!");
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
        </div>
    {/if}
</section>

<style lang="postcss">
    section {
        @apply relative z-10 w-full h-full min-h-screen flex flex-col justify-center items-center;

        input,
        p:not(.main-color),
        span:not(.main-color) {
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
                        @apply font-montserrat text-base text-main-content bg-secondary-color;
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
                @apply m-auto h-full w-6/12 flex flex-col justify-center items-center gap-4 font-content font-bold;

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
                @apply m-auto mt-6 w-full flex flex-row justify-center items-center;

                .prev_next_songs {
                    @apply flex flex-row justify-center items-start gap-8 w-full;

                    .search_wrapper {
                        @apply flex flex-col justify-start items-center gap-4 w-4/12;

                        .search_input_wrapper {
                            @apply flex flex-row justify-center items-center gap-4 w-full;
                        }
                    }

                    .track_list {
                        @apply flex flex-col justify-center items-center gap-2 w-5/12 text-center;

                        p {
                            @apply font-semibold text-lg;
                        }
                    }
                }

                .clients {
                    @apply flex flex-col gap-4 justify-start items-start flex-wrap;

                    .client {
                        @apply flex flex-row justify-center items-center gap-2 py-1 px-4 rounded-full bg-main-color-hover;

                        p {
                            @apply font-content;
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
            @apply flex flex-row justify-between items-center;
        }

        * {
            @apply dark:text-main-color-clear text-main-content;
        }
    }
</style>
