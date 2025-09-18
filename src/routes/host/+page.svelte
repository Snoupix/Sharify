<script lang="ts">
	import { LoaderCircle, SquareArrowOutUpRight } from "lucide-svelte";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";

	import { PUBLIC_SERVER_ADDR_DEV } from "$env/static/public";
	import Button from "$/components/button.svelte";
	import Logo from "$/components/logo.svelte";
	import Spotify from "$lib/spotify";
	import { bytes_to_uuid_str, get_storage_value, set_storage_value } from "$lib/utils";
	import { CommandResponse, HttpCommand } from "$lib/proto/cmd";
	import { roomErrorFromJSON, roomErrorToJSON } from "$lib/proto/room";
	import type { Nullable } from "$lib/types";
	import { tick } from "svelte";

	let autoname = $state(true);
	let room = $state({
		username: "",
		room_name: "",
	});
	// TODO FIXME: If user loads its page on /host, it won't show the form
	// even if s.he is connected to Spotify. Because it reacts on the $Spotify store
	// that can be either the class instance or null. But the inner is_ready is not
	// reactive. Maybe wrap it in a .svelte.ts to use $state rune ?
	let spotify_link = $derived($Spotify?.GenerateAuthLink?.bind($Spotify));
	let room_name_el: Nullable<HTMLInputElement> = $state(null);

	$effect(() => {
		if (autoname && room.username.trim().length !== 0) {
			room.room_name = `${room.username}'s room`;
		} else if (autoname && room.username.trim().length === 0) {
			room.room_name = "";
		}
	});

	async function create_room(e: SubmitEvent) {
		e.preventDefault();

		if (room.username.trim() == "" || room.room_name.trim() == "") {
			toast.error("Error: Invalid username or room name (they must not be empty)");
			return;
		}

		if (!$Spotify || !$Spotify.is_ready) {
			toast.error("Unexpected error: Spotify isn't (properly) linked to Sharify, please contact Snoupix");
			return;
		}

		const user_id = get_storage_value("user_id");

		if (user_id == null) {
			throw new Error(
				"Unexpected error: You are not logged in and/or you don't have a UUID set on your localstorage",
			);
		}

		const tokens = $Spotify.GetTokens();

		const command: HttpCommand = {
			createRoom: {
				username: room.username,
				userId: user_id,
				name: room.room_name,
				credentials: {
					accessToken: tokens.access_token,
					refreshToken: tokens.refresh_token,
					expiresIn: tokens.expires_in,
					createdAt: tokens.created_at.toString(),
				},
			},
		};

		const bytes = HttpCommand.encode(command).finish();

		const res = await fetch(`${PUBLIC_SERVER_ADDR_DEV}/v1`, {
			method: "POST",
			headers: {
				"Content-Type": "application/protobuf",
			},
			body: bytes as BodyInit,
		});

		if (res.status !== 201 || res.body === null) {
			console.error(res);
		}

		const res_bytes = await res.bytes();

		try {
			let res_cmd = CommandResponse.decode(res_bytes);

			if (res_cmd.room === undefined) {
				console.error(res_cmd);
				// TODO: Switch on FromJSON for proper string error
				toast(
					`An error occured while creating the room. ${res_cmd.genericError ?? roomErrorToJSON(roomErrorFromJSON(res_cmd.roomError))}`,
				);
				return;
			}

			set_storage_value({ user: res_cmd.room.users[0], current_room: res_cmd.room });

			toast(`Successfully created room ${res_cmd.room.name}!`);

			await goto(`/room/${bytes_to_uuid_str(res_cmd.room.id)}`);
		} catch (e: unknown) {
			console.error(e);
			toast(`An error occured while creating the room. ${e}`);
		}
	}
</script>

<section>
	{#if $Spotify !== null && $Spotify.is_ready}
		<form onsubmit={create_room}>
			<Logo animate={false} />
			<div>
				<label for="username">Username</label>
				<input
					class="input h-10 border-main px-2 !text-main placeholder:text-main"
					type="text"
					id="username"
					placeholder="Username"
					bind:value={room.username} />
			</div>
			<div>
				<label for="room-name">Room name</label>
				<div class="flex w-full flex-row items-center justify-start gap-4">
					<input
						bind:this={room_name_el}
						class="input h-10 border-main px-2 !text-main placeholder:text-main"
						disabled={autoname}
						type="text"
						id="room-name"
						placeholder="Room name"
						bind:value={room.room_name} />
					{#if autoname}
						<Button
							class_extended="border-main bg-main-hover text-main-content"
							onclick={async () => {
								autoname = false;
								await tick();
								room_name_el?.focus();
							}}>Rename</Button>
					{:else}
						<Button
							class_extended="border-main bg-main-hover text-main-content"
							onclick={() => (autoname = true)}>Auto name</Button>
					{/if}
				</div>
			</div>
			<div>
				<Button type="submit">Create the room</Button>
			</div>
		</form>
	{:else}
		<div>
			<Logo />
			<p>First, you need to link Spotify to Sharify !</p>
			{#await spotify_link?.()}
				<Button disabled={true} class_extended="flex flex-row justify-center items-center gap-4 w-50">
					Loading
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin stroke-main-content text-main-content" />
				</Button>
			{:then link}
				{#if typeof link === "string"}
					<a href={link}>Here you go <SquareArrowOutUpRight class="ml-2 w-5 stroke-main-content" /></a>
				{:else}
					<h2>Generated link error: {link} please contact Snoupix</h2>
				{/if}
			{:catch e}
				<h2>Unexpected error: {e} please contact Snoupix</h2>
			{/await}
		</div>
	{/if}
</section>

<style lang="postcss">
	@reference "$/app.css";

	section {
		@apply h-[calc(100vh-var(--nav-h))] w-full;

		form {
			@apply m-auto flex h-full w-3/12 flex-col items-center justify-center gap-8;

			> div {
				@apply flex w-full flex-col items-start justify-center gap-2;

				* {
					@apply font-content text-xl;
				}

				> :first-child {
					@apply text-lg;
				}
			}

			> div:last-child {
				@apply w-auto;
			}
		}

		> div {
			@apply m-auto flex h-screen w-4/12 flex-col items-center justify-center gap-8;

			p,
			a {
				@apply relative flex flex-row items-center justify-center text-xl font-bold;
			}

			:global(a > *) {
				@apply stroke-main;
			}

			a::after {
				content: "";
				display: block;
				position: absolute;
				bottom: -2px;
				left: auto;
				width: 95%;
				height: 2px;
				background: linear-gradient(to right, var(--color-bg), var(--color-main), var(--color-bg));
				border-radius: 1.25rem;

				&:hover {
					display: none;
					background: var(--color-main) !important;
				}
			}
		}
	}
</style>
