<script lang="ts">
    import { onMount, hasContext, getContext } from "svelte";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { Button } from "$/components/ui/button";
    import { LoaderCircle } from "lucide-svelte";
    import type { Writable } from "svelte/store";
    import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

    import type { PageData } from "./$types";
    import type { LayoutData } from "../../../$types"; // $/$types won't work somehow
    import { Input } from "$/components/ui/input";
    import CustomButton from "$/components/button.svelte";
    import { JOIN_PARTY } from "$/lib/queries";
    import type { Party } from "$/lib/types";
    import { bytes_to_uuid_str, get_storage_value, set_storage_value } from "$/lib/utils";

    if (!hasContext("GQL_Client")) {
        throw new Error("Unexpected error: Unable to get GraphQL client on context, please contact Snoupix");
    }

    const client: Writable<ApolloClient<NormalizedCacheObject> | null> = getContext("GQL_Client");

    if ($client == null) {
        throw new Error("Unexpected error: Unable to initiate GraphQL client, please contact Snoupix");
    }

    export let data: PageData & LayoutData;

    let username = "";
    let is_loading = false;
    let error = "";

    onMount(async () => {
        if (!data || !data.party) {
            toast("Error: Party not found");
            return await goto("/");
        }

        if (data.session?.user?.name) {
            username = data.session.user.name;
        }
    });

    async function join_party() {
        is_loading = true;

        if (username.trim() == "") {
            error = "Your username must be filled";
            is_loading = false;
            return;
        }

        const user_id = get_storage_value("user_id");

        if (user_id == null) {
            toast("Unexpected error: You're not logged in");
            return await goto("/");
        }

        const result = await $client?.mutate({
            mutation: JOIN_PARTY,
            variables: { id: data.party.id, username, user_id },
        });
        const room: (Party & { __typename: "Party" }) | { __typename: "PartyError"; error: string } | undefined =
            result?.data?.joinParty;

        if (!room || room.__typename == "PartyError") {
            error = `There was an error joining the party (${room?.error ?? "Unknown error"})`;
            console.error(result);
            is_loading = false;
            return;
        }

        const party_client = room.clients.find(c => c.username == username);

        if (party_client == undefined) {
            error = "Username not found on party clients, check the console for more details"; // TODO: Do better
            console.error(result);
            is_loading = false;
            return;
        }

        set_storage_value({ user: party_client, current_room: room });
        toast(`You successfully joined room "${room.name}"!`);
        await goto(`/room/${bytes_to_uuid_str(room.id)}`);
    }
</script>

{#if data && data.party}
    <section>
        <span>What's your username ?</span>
        <Input
            on:keydown={k => k.key == "Enter" && join_party()}
            type="text"
            disabled={is_loading}
            placeholder="username"
            bind:value={username} />
        {#if is_loading}
            <Button disabled>
                <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        {/if}
        {#if error != ""}
            <span class="text-red-500">{error}</span>
        {/if}
        <CustomButton on:click={join_party}>Join the party</CustomButton>
    </section>
{/if}

<style lang="postcss">
    section {
        @apply w-2/12 h-screen m-auto flex flex-col justify-center items-center gap-6;
    }
</style>
