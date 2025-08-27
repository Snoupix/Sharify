<script lang="ts">
	import { onMount } from "svelte";
	import { SquareArrowOutUpRight } from "lucide-svelte";
	import { goto } from "$app/navigation";
	import { Label, Button } from "bits-ui";
	import { toast } from "svelte-sonner";

	import { PUBLIC_SERVER_ADDR_DEV } from "$env/static/public";
	import CustomButton from "$/components/button.svelte";
	import Spotify from "$/lib/spotify";
	import { bytes_to_uuid_str, get_storage_value, set_storage_value } from "$/lib/utils";
	import Logo from "$/components/logo.svelte";
	import { CommandResponse, HttpCommand } from "$/lib/proto/cmd";

	let autoname = $state(true);
	let room = $state({
		username: "",
		room_name: "",
	});
	let spotify_link: Promise<string | Error> | undefined = $state();

	$effect(() => {
		if (autoname && room.username.trim() != "") {
			room.room_name = `${room.username}'s party`;
		} else if (autoname && room.username.trim() == "") {
			room.room_name = "";
		}
	});

	onMount(async () => {
		spotify_link = $Spotify?.GenerateAuthLink();
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
                    expiresIn: tokens.expires_in.toString(),
                    createdAt: tokens.created_at.toString(),
                },
            }
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
                toast(`An error occured while creating the room. ${res_cmd.genericError}`);
                return;
            }

            set_storage_value({ user: res_cmd.room.users[0], current_room: res_cmd.room });

            toast(`Successfully created party ${res_cmd.room.name}!`);

            await goto(`/room/${bytes_to_uuid_str(res_cmd.room.id)}`);
        } catch (e: unknown) {
            console.error(e);
            toast(`An error occured while creating the room. ${e}`);
        }
	}
</script>

<section>
	{#if $Spotify != null && $Spotify.is_ready}
		<form onsubmit={create_room}>
			<Logo />
			<div>
				<Label.Root for="username">Username</Label.Root>
				<input
					class="focus-visible:ring-main-color border-main-color bg-main-color-hover px-2 text-main-content placeholder:text-main-content"
					type="text"
					id="username"
					placeholder="Username"
					bind:value={room.username} />
			</div>
			<div>
				<Label.Root for="party_name">Party name</Label.Root>
				<div class="flex w-full flex-row gap-4">
					<input
						class="focus-visible:ring-main-color border-main-color bg-main-color-hover px-2 text-main-content placeholder:text-main-content"
						disabled={autoname}
						type="text"
						id="party_name"
						placeholder="Party name"
						bind:value={room.room_name} />
					{#if autoname}
						<Button.Root
							class="border-main-color bg-main-color-hover text-main-content"
							onclick={() => (autoname = false)}>Rename</Button.Root>
					{:else}
						<Button.Root
							class="border-main-color bg-main-color-hover text-main-content"
							onclick={() => (autoname = true)}>Auto name</Button.Root>
					{/if}
				</div>
			</div>
			<div>
				<CustomButton type="submit">Create the room</CustomButton>
			</div>
		</form>
	{:else}
		<div>
			<Logo />
			<p>First, you need to link Spotify to Sharify !</p>
			{#await spotify_link then link}
				{#if typeof link == "string"}
					<a href={link}>Here you go <SquareArrowOutUpRight class="ml-2 w-5 stroke-neutral-200" /></a>
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
		@apply w-full h-[calc(10/12*100vh)];

		form {
			@apply m-auto flex h-full w-3/12 flex-col items-center justify-center gap-8;

			> div {
				@apply flex w-full flex-col items-start justify-center gap-2;

				:global(> *) {
					@apply font-content text-xl;
				}

				:global(> :first-child) {
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
