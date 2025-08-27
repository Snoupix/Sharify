<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
	import type { Writable } from "svelte/store";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { DropdownMenu } from "bits-ui";
	import { Eye, EyeOff, Link, Settings } from "lucide-svelte";
	import type { Session } from "@auth/sveltekit";
	import { signIn, signOut } from "@auth/sveltekit/client";
	import { toast } from "svelte-sonner";

	import FancyButton from "$/components/fancy_button.svelte";
	import Button from "$/components/button.svelte";
	import Logo from "$/components/logo.svelte";
	import Spotify from "$/lib/spotify";
    import { leave_room_cmd } from "$lib/ws_impl";
	import { bytes_to_uuid_str, get_storage_value, get_user_role, set_theme, themes, write_to_clipboard, type LocalStorage } from "$lib/utils";
	import type { Room, RoomUser } from "$/lib/proto/room";
	import type { Nullable } from "$/lib/types";

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");

	const hidden_routes = ["/", "/auth_spotify", "/host", "/join"];
	// eslint-disable-next-line
	const login_methods = ["github", "discord", "google", "spotify", "twitch"] as const;

	let session: (Session & { user_uuid: string | null }) | null = $props();

	let path = $state("/");
	let profile = $state("");
	let spotify_interval: NodeJS.Timeout | null = $state(null);
	let theme: LocalStorage["theme"] = $state(null);
	let login_method: (typeof login_methods)[number] | undefined = $state(undefined);
	let current_user: RoomUser | null = $state(null);
	let show_link = $state(false);

	const is_logged_in = $derived(() => session !== null && new Date(session.expires).getTime() > Date.now());

	$effect(() => {
		if (page !== null && page.route.id !== null) {
			path = page.route.id;
		}
	});

	$effect(() => {
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
		await goto("/");
	}

	function get_party_link() {
		return `${location.origin}/join/${bytes_to_uuid_str($room_data!.id)}/${$room_data!.password}`;
	}

	async function copy_party_link() {
		await write_to_clipboard(
			get_party_link(),
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
</script>

<nav>
	{#if !hidden_routes.includes(path)}
		<Logo animate={false} class_extension="fixed left-0 top-0 px-8 py-4" />
	{/if}

    {#if path.match(/\/room\/[0-9a-f]*/) !== null}
        <div class="room-btns">
            <FancyButton
                class_extended="xl:text-base !text-red-500 font-montserrat border-red-500 hover:shadow-red-500 border-2"
                onclick={() => leave_room_cmd()}>
                {#if current_user && get_user_role($room_data, current_user?.roleId)?.permissions?.canManageRoom}
                    Close the room
                {:else}
                    Leave the room
                {/if}
            </FancyButton>
            {#if show_link}
                <div>
                    <input readonly value={get_party_link()} />
                    <Button
                        class_extended="eye rounded-3xl!"
                        title="Hide link"
                        onclick={() => (show_link = false)}>
                        <EyeOff class="stroke-main-content hover:cursor-pointer" />
                    </Button>
                </div>
            {:else}
                <div>
                    <FancyButton onclick={copy_party_link}>
                        Copy party link 
                        <Link class="ml-2 w-5 stroke-main-content hover:cursor-pointer" />
                    </FancyButton>
                    <Button
                        class_extended="rounded-3xl!"
                        title="Show link"
                        onclick={() => (show_link = true)}>
                        <Eye class="stroke-main-content hover:cursor-pointer" />
                    </Button>
                </div>
            {/if}
        </div>
    {/if}

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Settings />
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content>
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>
						<div class="flex items-center">Theme</div>
					</DropdownMenu.SubTrigger>
					<DropdownMenu.Portal>
						<DropdownMenu.SubContent>
							<DropdownMenu.RadioGroup
								value={theme ?? undefined}
								onchange={(e) => console.log(e.currentTarget.nodeValue)}>
								<DropdownMenu.GroupHeading>Theme</DropdownMenu.GroupHeading>
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
					{#if profile !== ""}
						<DropdownMenu.Item>
							<Button onclick={disconnect}>
								<svg
									class="mr-2 w-5 fill-main-content"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 496 512"
									><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
										d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" /></svg>
								Disconnect from {profile}
							</Button>
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<Button>How to</Button>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<Button>about</Button>
				</DropdownMenu.Item>
				{#if is_logged_in()}
					<DropdownMenu.Item>
						<Button onclick={() => signOut()}>Logout</Button>
					</DropdownMenu.Item>
				{:else}
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
                            <div class="flex items-center">Login</div>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent>
								<DropdownMenu.RadioGroup
									value={login_method ?? undefined}
									onchange={(e) => {
										switch (e.currentTarget.nodeValue) {
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
									<DropdownMenu.RadioItem
										title="Sign in with GitHub"
										class="select_item"
										value="github"
										><svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="lucide lucide-github"
											><path
												d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path
												d="M9 18c-4.51 2-5-2-7-2" /></svg
										></DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem
										title="Sign in with Google"
										class="select_item"
										value="google"
										><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"
											><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
												d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" /></svg
										></DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem
										title="Sign in with Discord"
										class="select_item"
										value="discord"
										><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"
											><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
												d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" /></svg
										></DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem
										title="Sign in with Spotify"
										class="select_item"
										value="spotify"
										><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"
											><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
												d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" /></svg
										></DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem
										title="Sign in with Twitch"
										class="select_item"
										value="twitch">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
											><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
												d="M391.2 103.5H352.5v109.7h38.6zM285 103H246.4V212.8H285zM120.8 0 24.3 91.4V420.6H140.1V512l96.5-91.4h77.3L487.7 256V0zM449.1 237.8l-77.2 73.1H294.6l-67.6 64v-64H140.1V36.6H449.1z" /></svg>
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
		<span>
			{value}
			{#if checked}
				✅
			{/if}
		</span>
	{/snippet}
</nav>

<style lang="postcss">
	@reference "$/app.css";

	nav {
		@apply relative z-10 h-[calc(1/12*100vh)] flex w-full flex-row items-center justify-end px-2;

        .room-btns {
            @apply flex w-auto flex-row items-end justify-center gap-4 p-4;

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
	}
</style>
