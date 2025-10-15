<script lang="ts">
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import {
		Pause,
		Play,
		SkipBack,
		SkipForward,
		Volume1,
		Volume2,
		VolumeX,
		Mic,
		EllipsisVertical,
		SquareArrowOutUpRight,
	} from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import { Skeleton } from "$/components/ui/skeleton";
	import { DropdownMenu } from "bits-ui";

	import { send_ws_command } from "$/lib/ws_impl";
	import CustomButton from "$/components/button.svelte";
	import { click_link, format_time, get_user_role, write_to_clipboard } from "$/lib/utils";
	import type { Nullable, SpotifyData } from "$/lib/types";
	import type { Room, RoomUser } from "$/lib/proto/room";

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");
	const spotify_data: Writable<Nullable<SpotifyData>> = getContext("SpotifyData");

	const {
		is_skeleton,
		current_user,
		song_progress_ms,
		set_song_progress_ms,
		volume,
		set_volume,
		on_cmd_send_error,
	}: {
		is_skeleton: boolean;
		current_user: RoomUser;
		song_progress_ms: number;
		set_song_progress_ms: (progress: number) => void;
		volume: number;
		set_volume: (percentage: number) => void;
		on_cmd_send_error: () => Promise<void>;
	} = $props();

	let _seek_debounce: NodeJS.Timeout | null = $state(null);
	let _volume_debounce: NodeJS.Timeout | null = $state(null);
	let show_volume = $state(false);

	function seek_debounce(value: number, delay: number = 400) {
		if (_seek_debounce !== null) {
			clearTimeout(_seek_debounce);
		}

		_seek_debounce = setTimeout(async () => {
			set_song_progress_ms(value);

			if (song_progress_ms !== -1 && song_progress_ms !== $spotify_data?.playback_state?.progressMs) {
				await send_ws_command({ seekToPos: song_progress_ms }, on_cmd_send_error);

				$spotify_data!.playback_state!.progressMs = song_progress_ms;
			}
		}, delay);
	}

	function volume_debounce(value: number, delay: number = 400) {
		if (_volume_debounce !== null) {
			clearTimeout(_volume_debounce);
		}

		_volume_debounce = setTimeout(() => {
			set_volume(value);
		}, delay);
	}

	async function play_resume() {
		await send_ws_command({ playResume: false }, on_cmd_send_error);
	}

	async function pause() {
		await send_ws_command({ pause: false }, on_cmd_send_error);
	}

	async function skip_next() {
		await send_ws_command({ skipNext: false }, on_cmd_send_error);
	}

	async function skip_previous() {
		await send_ws_command({ skipPrevious: false }, on_cmd_send_error);
	}
</script>

{#if is_skeleton}
	<div class="state-controls">
		<div class="title">
			<Skeleton class="h1 mt-4 ml-4 h-4 w-2/12" />
		</div>
		<div class="currently-playing">
			<Skeleton class="img" />
			<div class="track">
				<Skeleton class="h-4 w-32" />
				<Skeleton class="h-4 w-60" />
			</div>
			<div class="spotify-links">
				<Skeleton class="h-8 w-8 rounded-full" />
			</div>
		</div>
		<Skeleton class="h-2 w-7/12" />
		<Skeleton class="h-6 w-1/12" />
		<div class="player-controls">
			<Skeleton class="h-10 w-10 rounded-full" />
			<Skeleton class="h-10 w-10 rounded-full" />
			<Skeleton class="h-10 w-10 rounded-full" />
			<Skeleton class="h-10 w-10 rounded-full" />
		</div>
	</div>
{:else}
	<div class="state-controls">
		<div class="title">
			<h1><Mic /> Now playing</h1>
		</div>
		<div class="currently-playing">
			<img src={$spotify_data!.playback_state?.albumImageSrc} alt="album cover" />
			<div class="track">
				<span class="main text-xl">{$spotify_data!.playback_state?.trackName}</span>
				<span class="main text-lg">{$spotify_data!.playback_state?.artistName}</span>
			</div>
			<div class="spotify-links">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="round">
						<EllipsisVertical />
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content>
							<DropdownMenu.Item>
								<button
									class="flex h-8 flex-row items-center justify-center gap-2"
									onclick={click_link}>
									<a
										class="hover:text-main-content xl:text-sm"
										href={`https://open.spotify.com/track/${$spotify_data!.playback_state?.trackId}`}
										target="_blank">
										Spotify link
									</a>
									<SquareArrowOutUpRight class="w-5 cursor-pointer stroke-main" />
								</button>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<button
									class="h-8 cursor-pointer hover:text-main-content xl:text-sm"
									title="Copy Spotify URI to clipboard"
									onclick={() =>
										write_to_clipboard(
											`spotify:track:${$spotify_data?.playback_state?.trackId}`,
											() => {
												toast("Spotify URI copied to clipboard!");
											},
											console.error,
										)}>Spotify uri</button>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>
		</div>
		<span class="italic"
			>{format_time(song_progress_ms, $spotify_data!.playback_state?.durationMs ?? song_progress_ms * 2)}</span>
		{#key current_user}
			<input
				disabled={!get_user_role($room_data, current_user?.roleId)?.permissions?.canUseControls}
				class="w-2/4 cursor-grab accent-main"
				min={0}
				max={$spotify_data!.playback_state?.durationMs}
				value={song_progress_ms}
				onchange={(e) => seek_debounce(parseInt(e.currentTarget.value))}
				type="range" />
			{#if current_user !== null && get_user_role($room_data, current_user?.roleId)?.permissions?.canUseControls}
				<div class="player-controls">
					<CustomButton class_extended="round" title="Skip back to previous track" onclick={skip_previous}
						><SkipBack /></CustomButton>
					<CustomButton
						class_extended="round"
						title="Play/Pause the currently playing track"
						onclick={() => ($spotify_data!.playback_state?.isPlaying ? pause() : play_resume())}>
						{#if $spotify_data!.playback_state?.isPlaying}
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
							class="w-2/6 cursor-grab accent-main"
							min={0}
							max={100}
							value={$spotify_data!.playback_state?.deviceVolume}
							onchange={(e) => volume_debounce(parseInt(e.currentTarget.value))}
							title="change volume"
							type="range" />
					{/if}
				</div>
			{/if}
		{/key}
	</div>
{/if}

<style lang="postcss">
	@reference "$/app.css";

	.state-controls {
		@apply relative m-auto flex flex-col items-center justify-stretch gap-4 py-4 font-content font-bold;

		.title {
			@apply h-2/12 w-full;

			h1,
			:global(.h1) {
				@apply mt-2 ml-4 flex flex-row items-center justify-start gap-4 font-bold uppercase;
			}
		}

		.currently-playing {
			@apply relative flex h-6/12 w-full flex-row items-center justify-center gap-6;

			img,
			:global(.img) {
				@apply absolute top-0 left-0 mt-2 ml-4 h-40 w-40 rounded-xl border-4 border-secondary;
			}

			.track {
				@apply flex flex-col items-center justify-center gap-2 text-center;
			}

			.spotify-links {
				@apply absolute top-0 right-0 mr-4 flex flex-col items-end justify-center gap-4;
			}
		}

		.player-controls {
			@apply flex h-4/12 flex-row items-center justify-center gap-4;
		}
	}
</style>
