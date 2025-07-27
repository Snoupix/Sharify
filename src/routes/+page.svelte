<script lang="ts">
    import { goto } from "$app/navigation";
    import { onDestroy, onMount } from "svelte";
    import { env } from "$env/dynamic/public";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";

    import Logo from "$/components/logo.svelte";
    import { Button } from "$/components/ui/button";
    import CustomButton from "$/components/button.svelte";

    let server_i = $state(0);
    let server_loaded = $state(false);
    let server_timed_out = $state(false);
    let show_retry_button = $state(false);
    let server_interval: number | null = $state(null);
    let retry_timeout: number | null = $state(null);

    onMount(async () => {
        server_interval_fn();

        server_interval = setInterval(server_interval_fn, parseInt(env.PUBLIC_SV_INTERVAL!));
    });

    onDestroy(() => {
        if (server_interval != null) clearInterval(server_interval);
        if (retry_timeout != null) clearTimeout(retry_timeout);
    });

    async function server_interval_fn() {
        server_i += 1;

        if (server_loaded || server_i == parseInt(env.PUBLIC_SV_TIMEOUT!)) {
            server_timed_out = true;
            clearInterval(server_interval!);
            return;
        }

        const res = await fetch(env.PUBLIC_SERVER_ADDR_DEV!); // TODO: Change me on prod
        if (res.ok) {
            server_loaded = true;
            clearInterval(server_interval!);
            return;
        }

        // Rate limiter
        if (res.status == 429) {
            server_timed_out = true;
            clearInterval(server_interval!);
            return;
        }
    }

    function reload_page() {
        server_i = 0;
        server_loaded = false;
        server_timed_out = false;
        show_retry_button = false;
        server_interval = null;
        retry_timeout = null;
        // await invalidateAll(); => reload the load functions, but I need to reload the onMount
        window.location.reload();
    }

    $effect(() => {
        if (server_loaded || server_timed_out) {
            retry_timeout = setTimeout(() => {
                show_retry_button = true;
            }, 5000);
        }
    });
</script>

<section>
    <Logo />
    {#if !server_loaded || server_timed_out}
        {#if server_i == parseInt(env.PUBLIC_SV_TIMEOUT ?? "0")}
            <span>Failed to reach server, please try again later</span>
            {#if show_retry_button}
                <CustomButton on:click={reload_page}>Retry</CustomButton>
            {/if}
        {:else}
            <span>Trying to connect to server...{server_i > 1 ? ` (attempt ${server_i})` : ""}</span>
            <Button disabled>
                <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        {/if}
    {:else}
        <CustomButton on:click={async () => await goto("/host")}>Host</CustomButton>
        <CustomButton on:click={async () => await goto("/join")}>Join</CustomButton>
    {/if}
</section>

<style lang="postcss">
    section {
        @apply w-2/12 h-screen m-auto flex flex-col justify-center items-center gap-8;

        :global(> :first-child) {
            @apply mb-10;
        }

        span {
            @apply text-center text-xl font-bold;
        }
    }
</style>
