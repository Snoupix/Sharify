<script lang="ts">
	import { toast } from "svelte-sonner";
	import { X, Plus } from "lucide-svelte";

	import CustomButton from "$/components/button.svelte";
	import { Skeleton } from "$/components/ui/skeleton";
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
		search_input: string;
		search_results: Array<Track>;
		clear_search_results: () => void;
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

	async function add_track_to_queue_by_track(track: Track) {
		set_search_input("");

		const user = get_storage_value("user");

		if (user === null) {
			toast.error("Unexpected fatal error: Unable to get your room user data on local storage.");
			set_leaving(true);
			return await leave_room_cmd();
		}

		send_ws_command(
			{ addToQueue: { trackId: track.trackId, trackName: track.trackName, trackDuration: track.trackDuration } },
			on_cmd_send_error,
		);

		toast(`Track added to the owner's queue`);
	}

	async function add_track_to_queue_by_id(uri_url: string) {
		// TODO impl a command to add to queue by ID only and sv side,
		// process track the same as the addToQueue cmd
		const track_id = get_track_id_by_uri_url(uri_url);

		if (track_id === null) {
			console.debug(uri_url);
			toast("Error: Cannot parse URL/Spotify URI to track ID");
			return;
		}

		// TODO
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
		<div class="title">
			<Skeleton class="h1 h-4 w-36" />
		</div>
		<!-- TODO Fix -->
		<Skeleton class="h-4 w-6/12" />
		<hr />
		<div class="search-input-wrapper">
			<Skeleton class="h-4 w-6/12" />
			<Skeleton class="h-4 w-2/12" />
		</div>
	</div>
{:else}
	<div class="search-wrapper">
		<div class="title">
			<h1><Plus class="fill-main" /> Add songs</h1>
		</div>
		{@render _search_input()}
		<hr />
		<div class="search-input-wrapper">
			<input
				class="input px-2"
				title="Example: spotify:track:4PTG3Z6ehGkBFwjybzWkR8 or https://open.spotify.com/..."
				placeholder="Add a song by Spotify URI"
				bind:value={url_uri_input} />
			<button
				class="bg-main-hover font-montserrat text-base text-main-content hover:scale-95 hover:bg-main-hover"
				title="Add song to the owner's queue"
				onclick={() => add_track_to_queue_by_id(url_uri_input)}>Add</button>
		</div>

		{#if search_results.length !== 0}
			<div class="results-wrapper">
				<div class="search-results">
					<button class="close-btn" onclick={clear_search_results}>
						<X class="h-12 w-12" />
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
		@apply flex flex-col items-center justify-start gap-4 py-4;

		.title {
			@apply h-4/12 w-full;

			h1,
			:global(.h1) {
				@apply mt-2 ml-4 flex flex-row items-center justify-start gap-4 font-bold uppercase;
			}
		}

		hr {
			@apply w-9/12 border-main;
		}

		.search-input-wrapper {
			@apply flex w-9/12 flex-row items-center justify-center gap-4;
		}

		.results-wrapper {
			@apply absolute top-0 left-0 z-11 flex h-screen w-full flex-col items-center justify-center backdrop-blur-lg;

			.search-results {
				@apply relative h-9/12 w-9/12 overflow-y-scroll rounded-xl border border-main bg-bg;

				.close-btn {
					@apply sticky top-4 right-4 float-right cursor-pointer;
				}

				.layout {
					@apply my-8 flex w-full flex-col items-center justify-center gap-6;

					input {
						@apply mx-auto;
					}

					.results {
						@apply mx-auto flex w-10/12 flex-row flex-wrap items-start justify-center gap-4;
					}
				}
			}
		}
	}
</style>
