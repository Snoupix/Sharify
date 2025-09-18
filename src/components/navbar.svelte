<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
	import type { Writable } from "svelte/store";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { DropdownMenu } from "bits-ui";
	import { Check, Eye, EyeOff, Link, Settings, ChevronLeft } from "lucide-svelte";
	import type { Session } from "@auth/sveltekit";
	import { signIn, signOut } from "@auth/sveltekit/client";
	import { toast } from "svelte-sonner";

	import FancyButton from "$/components/fancy_button.svelte";
	import Button from "$/components/button.svelte";
	import Logo from "$/components/logo.svelte";
	import Spotify from "$lib/spotify";
	import { leave_room_cmd } from "$lib/ws_impl";
	import {
		bytes_to_uuid_str,
		get_storage_value,
		get_theme,
		get_user_role,
		set_theme,
		themes,
		write_to_clipboard,
		type LocalStorage,
	} from "$lib/utils";
	import type { Room, RoomUser } from "$lib/proto/room";
	import type { Nullable } from "$lib/types";

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");

	const hidden_routes = ["/", "/auth_spotify", "/host", "/join"];
	// eslint-disable-next-line
	const login_methods = ["github", "discord", "google", "spotify", "twitch"] as const;

	const { session }: { session: Nullable<Session & { user_uuid: string | null }> } = $props();

	let path = $state("/");
	let profile = $state("");
	let spotify_interval: NodeJS.Timeout | null = $state(null);
	let theme: LocalStorage["theme"] = $state(null);
	let login_method: (typeof login_methods)[number] | undefined = $state(undefined);
	let current_user: RoomUser | null = $state(null);
	let show_link = $state(false);

	let is_logged_in = $derived(session !== null && new Date(session.expires).getTime() > Date.now());

	$effect(() => {
		if (page !== null && page.route.id !== null) {
			path = page.route.id;
		}
	});

	$effect(() => {
		if (theme === null) return;

		set_theme(theme ?? null);
	});

	onMount(() => {
		theme = get_storage_value("theme") ?? "purple";

		spotify_interval = setInterval(() => {
			profile = $Spotify?.current_profile?.display_name ?? "";
		}, 2000);

		current_user = get_storage_value("user");
	});

	onDestroy(() => spotify_interval !== null && clearInterval(spotify_interval));

	async function disconnect() {
		$Spotify?.Disconnect();
		toast.success("Successfully disconnected from Spotify");
	}

	async function logout() {
		await signOut();
		toast.success("Successfully logged out");
	}

	function get_room_link() {
		return `${location.origin}/join/${bytes_to_uuid_str($room_data!.id)}/${$room_data!.password}`;
	}

	async function copy_room_link() {
		await write_to_clipboard(
			get_room_link(),
			() => {
				toast("Room link copied successfully to your clipboard !");
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

	function upper_first_char(theme: string) {
		return theme
			.split("")
			.map((c, i) => {
				if (i !== 0) return c;

				return c.toUpperCase();
			})
			.join("");
	}
</script>

<nav>
	{#if !hidden_routes.includes(path)}
		<Logo animate={false} top_left={true} />
	{/if}

	{#if path.match(/\/room\/[0-9a-f]*/) !== null}
		<div class="room-btns">
			<FancyButton
				class_extended="!text-red-500 border-red-500 hover:shadow-red-500 border-2"
				onclick={() => leave_room_cmd()}>
				{#if current_user && get_user_role($room_data, current_user?.roleId)?.permissions?.canManageRoom}
					Close the room
				{:else}
					Leave the room
				{/if}
			</FancyButton>
			{#if $room_data !== null}
				{#if show_link}
					<span>{get_room_link()}</span>
					<FancyButton
						class_extended="!rounded-3xl border-secondary !w-12 flex justify-center items-center hover:*:stroke-main"
						title="Hide link"
						onclick={() => (show_link = false)}>
						<EyeOff class="stroke-secondary transition-colors hover:cursor-pointer" />
					</FancyButton>
				{:else}
					<FancyButton
						onclick={copy_room_link}
						class_extended="flex flex-row justify-center items-center gap-2 border-secondary">
						Copy room link
						<Link class="w-5 stroke-main-content hover:cursor-pointer" />
					</FancyButton>
					<FancyButton
						class_extended="!rounded-3xl border-secondary !w-12 flex justify-center items-center hover:*:stroke-main"
						title="Show link"
						onclick={() => (show_link = true)}>
						<Eye class="stroke-secondary transition-colors hover:cursor-pointer" />
					</FancyButton>
				{/if}
			{/if}
		</div>
	{/if}

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Settings class="transform cursor-pointer transition-transform duration-500 hover:rotate-180" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content class="mt-2 mr-2">
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>
						<button><ChevronLeft />Theme</button>
					</DropdownMenu.SubTrigger>
					<DropdownMenu.Portal>
						<DropdownMenu.SubContent>
							<DropdownMenu.RadioGroup
								value={theme ?? undefined}
								onValueChange={(s) => {
									set_theme(s as LocalStorage["theme"]);
									theme = get_theme();
								}}>
								{#each themes as value, i (i)}
									<DropdownMenu.RadioItem {value}>
										{@render theme_item({
											value,
											checked: theme === null ? value === "purple" : theme === value,
										})}
									</DropdownMenu.RadioItem>
								{/each}
							</DropdownMenu.RadioGroup>
						</DropdownMenu.SubContent>
					</DropdownMenu.Portal>
				</DropdownMenu.Sub>
				<DropdownMenu.Item>
					<button>How to</button>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<button>About</button>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<button onclick={() => goto("/report")}> Report </button>
				</DropdownMenu.Item>
				{#if profile !== ""}
					<DropdownMenu.Item>
						<button onclick={disconnect} title={`Disconnect from ${profile}`}>
							<!-- For some reasons this div **needs** to exists. If not the button's flex is gonna make it have a 0px width -->
							<div>
								<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
								</svg>
							</div>
							Logout
						</button>
					</DropdownMenu.Item>
				{/if}
				{#if is_logged_in}
					<DropdownMenu.Item>
						<button title="Disconnect from your account" onclick={logout}>Logout</button>
					</DropdownMenu.Item>
				{:else}
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<button><ChevronLeft />Login</button>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent>
								<DropdownMenu.RadioGroup
									value={login_method ?? undefined}
									onValueChange={(v) => {
										switch (v) {
											case "github":
												signIn("github");
												break;
											case "google":
												signIn("google");
												break;
											case "discord":
												signIn("discord");
												break;
											case "spotify":
												signIn("spotify");
												break;
											case "twitch":
												signIn("twitch");
												break;
											default:
												break;
										}
									}}>
									<!-- svg icons are from https://github.com/simple-icons/simple-icons -->
									<DropdownMenu.RadioItem title="Sign in with GitHub" value="github">
										<button>
											<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
											</svg>
											Github
										</button>
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem title="Sign in with Google" value="google">
										<button>
											<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
											</svg>
											Google
										</button>
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem title="Sign in with Discord" value="discord">
										<button>
											<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
											</svg>
											Discord
										</button>
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem title="Sign in with Spotify" value="spotify">
										<button>
											<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
											</svg>
											Spotify
										</button>
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem title="Sign in with Twitch" value="twitch">
										<button>
											<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
											</svg>
											Twitch
										</button>
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>

	{#snippet theme_item({ value, checked }: { value: string; checked: boolean })}
		<button class="!justify-center">
			{#if checked}
				<Check />
			{/if}
			{upper_first_char(value)}
		</button>
	{/snippet}
</nav>

<style lang="postcss">
	@reference "$/app.css";

	:global([data-dropdown-menu-item]) {
		@apply relative z-15 w-full px-4 py-2;
	}

	:global([data-dropdown-menu-content]) {
		@apply z-14 flex max-w-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-main bg-bg text-nowrap text-ellipsis;

		button {
			@apply flex w-full cursor-pointer flex-row items-center justify-start gap-2 hover:scale-105 hover:text-shadow-lg hover:text-shadow-main;

			svg {
				@apply !h-6 !w-6 fill-main;
			}
		}
	}

	nav {
		@apply relative z-10 flex h-[var(--nav-h)] w-full flex-row items-center justify-end px-4;

		.room-btns {
			@apply flex w-auto flex-row items-end justify-center gap-4 p-4;

			:global(> button) {
				@apply font-montserrat text-base text-main hover:border-bg;
			}

			:global(> span) {
				@apply font-montserrat text-base text-main-content;
			}
		}
	}
</style>
