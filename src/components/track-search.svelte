<script lang="ts">
	import { toast } from "svelte-sonner";
	import { X, Plus } from "lucide-svelte";

    import CustomButton from "$/components/button.svelte";
    import { leave_room_cmd, send_ws_command } from "$/lib/ws_impl";
	import { get_storage_value } from "$/lib/utils";
	import type { Track } from "$/lib/proto/spotify";

    let _search_debounce: NodeJS.Timeout | null = $state(null);
	let url_uri_input = $state("");

    const {
        is_skeleton,
        search_input,
        search_results,
        clear_search_results,
        set_search_input,
        set_leaving,
        on_cmd_send_error,
    }: {
        is_skeleton: boolean;
        search_input: string,
        search_results: Array<Track>;
        clear_search_results: () => void,
        set_search_input: (_: string) => void;
        set_leaving: (_: boolean) => void;
        on_cmd_send_error: () => Promise<void>;
    } = $props();

	function search_debounce(value: string, delay: number = 600) {
		if (_search_debounce !== null) {
			clearTimeout(_search_debounce);
		}

		_search_debounce = setTimeout(() => {
			set_search_input(value);
		}, delay);
	}

	async function add_track_to_queue(track_id: Track["trackId"]) {
		set_search_input("");

		const user = get_storage_value("user");

		if (user === null) {
			toast.error("Unexpected fatal error: Unable to get your room user data on local storage.");
            set_leaving(true);
			return await leave_room_cmd();
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
			return s.split(":").pop() ?? null;
		}

		return s.split("/").pop()?.split("?").shift() ?? null;
	}
</script>

<!-- TODO: Clear the input on search success -->
{#snippet _search_input()}
    <input
        class="input w-9/12"
        placeholder="Search a song by name"
        value={search_input}
        oninput={(e) => search_debounce(e.currentTarget.value)} />
{/snippet}

{#if is_skeleton}
<div class="search-wrapper">
</div>
{:else}
<div class="search-wrapper">
    <div class="title">
        <h1><Plus class="fill-main" /> Add songs</h1>
    </div>
    {@render _search_input()}
    <hr />
    <div class="search_input_wrapper">
        <input
            class="input px-2"
            title="Example: spotify:track:4PTG3Z6ehGkBFwjybzWkR8 or https://open.spotify.com/..."
            placeholder="Add a song by Spotify URI"
            bind:value={url_uri_input} />
        <button
            class="font-montserrat text-base text-main-content bg-main-hover hover:bg-main-hover hover:scale-95"
            title="Add song to the owner's queue"
            onclick={() => add_track_to_queue_by_id(url_uri_input)}>Add</button>
    </div>

    {#if search_results.length !== 0}
        <div class="results-wrapper">
            <div class="search-results">
                <button class="close-btn" onclick={clear_search_results}>
                    <X class="w-12 h-12" />
                </button>
                <div class="layout">
                    {@render _search_input()}
                    <div class="results">
                        {#each search_results as track (track.trackId)}
                            <CustomButton
                                class_extended="font-montserrat text-base text-main-content bg-main-hover hover:bg-main-hover hover:scale-95"
                                onclick={() => add_track_to_queue_by_track(track)}
                                >{track.trackName} - {track.artistName}</CustomButton>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
{/if}

<style lang="postcss">
    @reference "$/app.css";

    .search-wrapper {
        @apply py-4 flex flex-col items-center justify-start gap-4;

        .title {
            @apply w-full h-4/12;

            h1, :global(.h1) {
                @apply mt-2 ml-4 flex flex-row justify-start items-center gap-4 uppercase font-bold;
            }
        }

        hr {
            @apply border-main w-9/12;
        }

        .search_input_wrapper {
            @apply flex w-full flex-row items-center justify-center gap-4;
        }

        .results-wrapper {
            @apply z-11 absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center backdrop-blur-lg;

            .search-results {
                @apply relative w-9/12 h-9/12 bg-bg border border-main rounded-xl overflow-y-scroll;

                .close-btn {
                    @apply sticky top-4 right-4 float-right cursor-pointer;
                }

                .layout {
                    @apply my-8 w-full flex flex-col justify-center items-center gap-6;

                    input {
                        @apply mx-auto;
                    }

                    .results {
                        @apply w-10/12 mx-auto flex flex-row flex-wrap items-start justify-center gap-4;
                    }
                }
            }
        }
    }
</style>
