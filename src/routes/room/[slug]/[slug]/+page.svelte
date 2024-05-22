<script lang="ts">
	import websocket from "websocket";
	import { getContext, hasContext, onDestroy, onMount } from "svelte";
	import { page } from "$app/stores";
	import type { Writable } from "svelte/store";
	import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
	import { EyeOff, Link, LoaderCircle } from "lucide-svelte";

	import ws, { init_ws } from "$/lib/ws_store";
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import { Button } from "$/components/ui/button";
	import { Input } from "$/components/ui/input";
	import type { Party } from "$/lib/types";

	if (!hasContext("GQL_Client")) {
		throw new Error("Unexpected error: Unable to get GraphQL client on context, please contact Snoupix");
	}

	if (!hasContext("RoomData")) {
		throw new Error("Unexpected error: Unable to get room data context, please contact Snoupix");
	}

	const room_data: Writable<Party> = getContext("RoomData");
	const client: Writable<ApolloClient<NormalizedCacheObject> | null> = getContext("GQL_Client");

	if ($client == null) {
		throw new Error("Unexpected error: Unable to initiate GraphQL client, please contact Snoupix");
	}

	let show_link = false;

	onMount(() => {
		const pathname_split = $page.url.pathname.split("/");

		if (pathname_split.length != 4) {
			toast.push("Unexpected error: Bad pathname", { duration: 2500 });
			setTimeout(() => goto("/"), 2500);
		}

		const [room_id, client_id] = pathname_split.slice(2).map(n => parseInt(n));

		init_ws(room_id, client_id, undefined, undefined, on_ws_error, on_ws_message);
	});

	onDestroy(() => $ws?.close());

	function on_ws_message(message: websocket.IMessageEvent) {
		if (typeof message.data != "string") {
			return;
		}

		const data = JSON.parse(message.data);

		switch (data.type) {
			case "lobby_data":
				$room_data = data.data;
				console.log($room_data);
				break;
			default:
				console.error("Unhandled case on WS message. Data: ", data);
		}
	}

	function on_ws_error(e: Error) {
		console.error("Unable to connect to server WebSocket, redirecting...", e);
		goto("/");
	}

	function get_party_link() {
		return `${location.origin}/join/${$room_data.id}/${$room_data.password}`;
	}

	async function copy_party_link() {
		try {
			const type = "text/plain";
			const blob = new Blob([get_party_link()], { type });
			const data = [new ClipboardItem({ [type]: blob })];
			await navigator.clipboard.write(data);
			toast.push("Party link copied successfully to your clipboard !");
		} catch (e) {
			console.error(
				"Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
				e,
			);
			toast.push(
				"Unable to write to clipboard (probably unsupported on your browser), please copy the link yourself",
			);
		}
	}
</script>

<section>
	{#if $ws != null && $ws.readyState != $ws.OPEN}
		<div class="loading">
			<span>Connecting to server...</span>
			<Button disabled>
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				Please wait
			</Button>
		</div>
	{:else}
		<div>
			<header>
				{#if show_link}
					<div>
						<Input disabled value={get_party_link()} />
						<EyeOff class="hover:cursor-pointer" on:click={() => (show_link = false)} />
					</div>
				{:else}
					<div>
						<Input disabled value="Party link" />
						<Link class="hover:cursor-pointer" on:click={copy_party_link} />
						<EyeOff class="hover:cursor-pointer" on:click={() => (show_link = true)} />
					</div>
				{/if}
			</header>
		</div>
	{/if}
</section>

<style lang="postcss">
	section {
		@apply w-full h-screen flex flex-col justify-center items-center;

		.loading {
			@apply w-2/12 flex flex-col justify-center items-center gap-8;

			span {
				@apply text-center text-xl font-bold;
			}
		}

		div {
			@apply m-auto w-full h-[85%];

			header {
				@apply w-full flex flex-row gap-4 justify-center items-end;

				div {
					@apply w-auto flex flex-row gap-2 justify-center items-center;
				}
			}
		}
	}
</style>
