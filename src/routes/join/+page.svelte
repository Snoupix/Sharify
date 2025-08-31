<script lang="ts">
    import Logo from "$/components/logo.svelte";
    import CustomButton from "$/components/button.svelte";
    import { goto } from "$app/navigation";

    let room_id = $state("");
    let room_password = $state("");
    let error = $state("");

    async function join_room() {
        if (room_id.trim().length !== 0 || room_password.trim().length !== 0) {
            error = "Room ID and Room password must not be empty";
            return;
        }

        await goto(`/join/${room_id}/${room_password}`);
    }
</script>

<section>
    <Logo class_extension="mb-4" />
    <input class="input" type="text" placeholder="Room ID" bind:value={room_id} />
    <input class="input" type="text" placeholder="Room password" bind:value={room_password} />
    {#if error !== ""}
        <span class="text-red-500">{error}</span>
    {/if}
    <CustomButton onclick={join_room}>Join party</CustomButton>
</section>

<style lang="postcss">
    @reference "$/app.css";

    section {
        @apply m-auto w-4/12 h-screen flex flex-col gap-6 justify-center items-center;

        input {
            @apply font-content text-base placeholder:text-main-content text-main-content bg-main-hover ring-main border-none outline-none w-[25rem];
        }
    }
</style>
