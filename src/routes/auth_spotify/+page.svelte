<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";

    import Logo from "$/components/logo.svelte";
    import CustomButton from "$/components/button.svelte";
    import Spotify from "$/lib/spotify";
    import { click_link } from "$/lib/utils";

    let spotify_error = "";
    let code_missing = false;
    let interval: NodeJS.Timeout | null = null;
    let spotify_is_ready = false;

    onMount(async () => {
        const code = $page.url.searchParams.get("code");
        const error = $page.url.searchParams.get("error");

        if (error) {
            spotify_error = error;
            return;
        }

        if (!code) {
            code_missing = true;
            return;
        }

        $Spotify?.FetchAccessToken(code);

        interval = setInterval(() => {
            spotify_is_ready = $Spotify?.is_ready ?? false;
        }, 5000);
    });

    onDestroy(() => interval != null && clearInterval(interval));
</script>

<section>
    <Logo />
    {#if code_missing}
        <h3>ERROR: There is no Spotify code provided, please try again or contact Snoupix</h3>
        <CustomButton on:click={click_link}>
            <a href="/host" data-cy="auth-text">Go back</a>
        </CustomButton>
    {:else if spotify_error != ""}
        <h3>
            ERROR: There was an error getting your Spotify token ({spotify_error}), please try again or contact Snoupix
        </h3>
        <CustomButton on:click={click_link}>
            <a href="/host" data-cy="auth-text">Go back</a>
        </CustomButton>
    {:else if !spotify_is_ready}
        <h3>Processing your Spotify token...</h3>
        <div class="loader"></div>
    {:else}
        {#await $Spotify && $Spotify.GetProfile() then profile}
            {#if profile instanceof Error}
                <h3>ERROR: There was an error getting your profile, please contact Snoupix {profile}</h3>
                <CustomButton on:click={click_link}>
                    <a href="/host" data-cy="auth-text">Go back</a>
                </CustomButton>
            {:else}
                <h3>
                    Your Spotify account is successfully linked to Sharify, you may proceed to create a room {profile?.display_name ??
                        "unknown"} !
                </h3>
                <CustomButton>
                    <a href="/host" data-cy="auth-text">Create a room</a>
                </CustomButton>
            {/if}
        {:catch e}
            <h3>ERROR: There was an error getting your profile, please contact Snoupix {e}</h3>
            <CustomButton on:click={click_link}>
                <a href="/host" data-cy="auth-text">Go back</a>
            </CustomButton>
        {/await}
    {/if}
</section>

<style lang="postcss">
    section {
        @apply flex flex-col items-center justify-center content-center gap-8 h-screen;

        h3 {
            @apply text-main-content;
        }

        a {
            @apply text-2xl font-semibold;
        }
    }
</style>
