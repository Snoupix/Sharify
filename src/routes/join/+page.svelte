<script lang="ts">
	import Logo from "$/components/logo.svelte";
	import CustomButton from "$/components/button.svelte";
	import { goto } from "$app/navigation";

	let room_id = $state("");
	let room_password = $state("");
	let error = $state("");

	async function join_room() {
		if (room_id.trim().length === 0 || room_password.trim().length === 0) {
			error = "Room ID and Room password must not be empty";
			return;
		}

		await goto(`/join/${room_id}/${room_password}`);
	}
</script>

<svelte:head>
	<title>Sharify</title>
</svelte:head>

<section>
	<Logo class_extension="mb-4" />
	<input class="input" type="text" placeholder="Room ID" bind:value={room_id} />
	<input class="input" type="text" placeholder="Room password" bind:value={room_password} />
	{#if error !== ""}
		<span class="text-red-500">{error}</span>
	{/if}
	<CustomButton onclick={join_room}>Join room</CustomButton>
</section>

<style lang="postcss">
	@reference "$/app.css";

	section {
		@apply m-auto flex h-[calc(100vh-var(--nav-h))] w-4/12 flex-col items-center justify-center gap-6;

		input {
			@apply w-[25rem] border-none bg-main-hover font-content text-base text-main-content ring-main outline-none placeholder:text-main-content;
		}
	}
</style>
