<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { SquareArrowOutUpRight } from "lucide-svelte";

    import Logo from "$/components/logo.svelte";
    import { Button } from "$/components/ui/button";
    import * as Select from "$/components/ui/select";
    import Spotify from "$/lib/spotify";
    import { get_storage_value, set_theme } from "$/lib/utils";

    const hidden_routes = ["/", "/auth_spotify", "/host", "/join"];

    let path = "/";
    let profile = "";
    let spotify_interval: NodeJS.Timeout | null = null;
    let theme = "system";

    $: if ($page != null && $page.route.id != null) {
        path = $page.route.id;
    }

    onMount(() => {
        theme = get_storage_value("theme") ?? "system";

        spotify_interval = setInterval(() => {
            profile = $Spotify?.current_profile?.display_name ?? "";
        }, 2000);
    });

    onDestroy(() => spotify_interval != null && clearInterval(spotify_interval));

    async function disconnect() {
        $Spotify?.Disconnect();
        await goto("/");
    }
</script>

<nav>
    {#if !hidden_routes.includes(path)}
        <Logo class_extension="fixed left-0 top-0 px-8 py-4" />
    {/if}

    <div>
        {#if profile != ""}
            <Button on:click={disconnect}>
                <svg class="w-5 mr-2 fill-main-content" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"
                    ><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
                        d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" /></svg>
                Disconnect from {profile}
            </Button>
        {/if}
        <Select.Root
            selected={{ label: "Theme", value: theme }}
            onSelectedChange={e => {
                if (e != undefined) {
                    switch (e.value) {
                        case "light":
                            set_theme("light");
                            break;
                        case "dark":
                            set_theme("dark");
                            break;
                        default:
                            set_theme(null);
                            break;
                    }
                }
            }}>
            <Select.Trigger class="xl:w-32">
                <!--<Select.Value class="text-main-content" placeholder="Theme" />-->
                <span class="text-main-content text-base font-montserrat font-medium">Theme</span>
            </Select.Trigger>
            <Select.Content class="select_content">
                <Select.Item class="select_item" value="system">System</Select.Item>
                <Select.Item class="select_item" value="light">Light</Select.Item>
                <Select.Item class="select_item" value="dark">Dark</Select.Item>
            </Select.Content>
        </Select.Root>
        <Button>
            <a href="https://github.com/Snoupix/Sharify" target="_blank"
                >GitHub <SquareArrowOutUpRight class="ml-2 w-4 stroke-main-content" /></a>
        </Button>
        <Button>About</Button>
        <Button>Contact</Button>
    </div>
</nav>

<style lang="postcss">
    nav {
        @apply fixed z-50 right-0 top-0 w-auto h-16;

        div {
            @apply w-auto flex flex-row gap-6 justify-between items-center p-4;

            :global(> *:not(.custom_btn)) {
                @apply font-montserrat text-base text-main-content bg-secondary-color;
                display: block ruby; /* needed to align text & svg on "a" tag */
            }

            a {
                @apply no-underline;
            }
        }
    }
</style>
