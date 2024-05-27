<script lang="ts">
	import { onMount, hasContext, getContext } from "svelte";
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import { Button } from "$/components/ui/button";
	import { LoaderCircle } from "lucide-svelte";
	import type { Writable } from "svelte/store";
	import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

	import type { PageData } from "./$types";
	import { Input } from "$/components/ui/input";
	import CustomButton from "$/components/button.svelte";
	import { JOIN_PARTY } from "$/lib/queries";
	import type { Party } from "$/lib/types";

	if (!hasContext("GQL_Client")) {
		throw new Error("Unexpected error: Unable to get GraphQL client on context, please contact Snoupix");
	}

	const client: Writable<ApolloClient<NormalizedCacheObject> | null> = getContext("GQL_Client");

	if ($client == null) {
		throw new Error("Unexpected error: Unable to initiate GraphQL client, please contact Snoupix");
	}

	export let data: PageData;

	let username = "";
	let is_loading = false;
	let error = "";

	onMount(async () => {
		if (!data || !data.party) {
			toast.push("Error: Party not found");
			return await goto("/");
		}
	});

	async function join_party() {
		is_loading = true;

		if (username.trim() == "") {
			error = "Your username must be filled";
			is_loading = false;
			return;
		}

		const result = await $client?.mutate({ mutation: JOIN_PARTY, variables: { id: data.party.id, username } });
		const party: (Party & { __typename: "Party" }) | { __typename: "PartyError"; error: string } | undefined =
			result?.data?.joinParty;

		if (!party || party.__typename == "PartyError") {
			error = `There was an error joining the party (${party?.error ?? "Unknown error"})`;
			console.error(result);
			is_loading = false;
			return;
		}

		const party_client = party.clients.find(c => c.username == username);

		if (party_client == undefined) {
			error = "Username not found on party clients, check the console for more details"; // TODO: Do better too
			console.error(result);
			is_loading = false;
			return;
		}

		toast.push(`You successfully joined room "${party.name}"!`);
		await goto(`/room/${party.id}/${party_client.id}`);
	}
</script>

{#if data && data.party}
	<section>
		<span>What's your username ?</span>
		<Input type="text" disabled={is_loading} placeholder="username" bind:value={username} />
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
