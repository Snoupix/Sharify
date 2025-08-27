<script lang="ts">
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { toast } from "svelte-sonner";

    import { Skeleton } from "$/components/ui/skeleton";
	import CustomButton from "$/components/button.svelte";
	import type { Nullable, SpotifyData } from "$/lib/types";
	import type { Room, RoomTrack } from "$/lib/proto/room";
	import { write_to_clipboard, zip_iter } from "$/lib/utils";
	import { Track } from "$/lib/proto/spotify";

	const ETab = {
		Next: 0,
		Previous: 1,
	} as const;

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");
	const spotify_data: Writable<Nullable<SpotifyData>> = getContext("SpotifyData");

	const {
		is_skeleton,
	}: {
		is_skeleton: boolean;
	} = $props();

	let displayed_songs: (typeof ETab)[keyof typeof ETab] = $state(ETab.Next);
</script>

{#if is_skeleton}
	<div class="song-queue">
        <div class="tabs">
            <Skeleton class="s-btn w-16 !cursor-default" />
            <Skeleton class="s-btn w-16 !cursor-default" />
        </div>

        <div class="tracks">
            {#each new Array(5).fill(1).map((i, j) => i + j) as i (i)}
                <div class="track">
                    <div class="left">
                        <div>
                            <span>{i}</span>
                        </div>
                        <div class="details">
                            <Skeleton class="s-h2 w-36 h-5" />
                            <Skeleton class="s-span w-24 h-4" />
                        </div>
                    </div>
                    <div class="right">
                        <Skeleton class="s-span w-8" />
                        <div class="btns">
                            <Skeleton class="w-6" />
                            <Skeleton class="w-6" />
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{:else}
	<div class="song-queue">
        <div class="tabs">
            <button
                class:active={displayed_songs == ETab.Next}
                onclick={() => (displayed_songs = ETab.Next)}
            >Up next</button>
            <button
                class:active={displayed_songs == ETab.Previous}
                onclick={() => (displayed_songs = ETab.Previous)}
            >Recently played</button>
        </div>

		{#snippet track_line([i, track, room_track]: [number, Nullable<Track>, Nullable<RoomTrack>])}
			<!-- Useless condition check because it cannot be null but it satisfies the compiler/lsp -->
			{#if track !== null}
				<div class="track">
                    <div class="left">
                        <div>
                            <span>{i + 1}</span>
                        </div>
                        <div class="details">
                            <h2>{track.trackName}</h2>
                            <span>{track.artistName}</span>
                        </div>
                    </div>
                    <div class="right">
                        <span
                            >{room_track?.trackId === track?.trackId
                                ? `Added by: (${$room_data?.users.find((u) => u.id === room_track?.userId)?.username ?? "user not found"})`
                                : "From owner's queue"}</span>
                        <div class="btns">
                            <a href={`https://open.spotify.com/track/${track.trackId}`} target="_blank">
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
                    </div>
				</div>
			{/if}
		{/snippet}

        <div class="tracks">
		{#if displayed_songs === ETab.Next}
			{#each zip_iter($room_data?.tracksQueue ?? [], $spotify_data?.next_tracks.filter((_, i) => i < 5) ?? []) as [room_track, track], i (i)}
				{@render track_line([i, track, room_track])}
			{/each}
		{:else if displayed_songs === ETab.Previous}
			{#each $spotify_data?.recent_tracks.filter((_, i) => i < 5) ?? [] as track, i (i)}
				{@render track_line([i, track, null])}
			{/each}
		{:else}
			<h1>Unreachable</h1>
		{/if}
        </div>
	</div>
{/if}

<style lang="postcss">
	@reference "$/app.css";

	.song-queue {
        @apply py-4 flex flex-col justify-center items-center gap-4;

        .tabs {
            @apply p-2 h-3/12 flex flex-row justify-center items-center gap-4 overflow-hidden;

            button, :global(.s-btn) {
                @apply rounded-xl px-4 py-2 hover:bg-secondary/40 cursor-pointer;

                &.active {
                    @apply text-main-content bg-secondary/40;
                }
            }
        }

        .tracks {
            @apply h-9/12 relative flex flex-col justify-stretch items-center w-full gap-2 overflow-y-scroll px-6;

            .track {
                @apply px-4 !min-h-20 w-full flex flex-row items-stretch justify-between hover:rounded-xl hover:bg-secondary/25;

                .left, .right {
                    @apply flex flex-row justify-center items-center gap-4;
                }

                .left {
                    > :first-child {
                        @apply flex justify-center items-center rounded-full border border-secondary w-8 h-8;

                        span {
                            @apply text-center;
                        }
                    }

                    .details {
                        @apply flex flex-col items-stretch justify-start gap-2;

                        h2, :global(.s-h2) {
                            @apply text-lg font-bold;
                        }

                        span, :global(.s-span) {
                            @apply text-sm;
                        }
                    }
                }

                .right {
                    @apply flex flex-col justify-center items-end gap-2;

                    .btns {
                        @apply flex flex-row items-center justify-start gap-2;
                    }

                    span, :global(.s-span) {
                        @apply text-right;
                    }
                }
            }
        }
	}
</style>
