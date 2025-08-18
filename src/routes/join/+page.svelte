<script lang="ts">
    import Logo from "$/components/logo.svelte";
    import CustomButton from "$/components/button.svelte";
    import { goto } from "$app/navigation";

    let room_id = "";
    let room_password = "";
    let error = "";

    async function join_room() {
        if (room_id.trim() == "" || room_password.trim() == "") {
            error = "Room ID and Room password must not be empty";
            return;
        }

        await goto(`/join/${room_id}/${room_password}`);
    }
</script>

<section>
    <Logo class_extension="mb-4" />
    <input type="text" placeholder="Room ID" bind:value={room_id} />
    <input type="text" placeholder="Room password" bind:value={room_password} />
    {#if error != ""}
        <span class="text-red-500">{error}</span>
    {/if}
    <CustomButton onclick={join_room}>Join party</CustomButton>
</section>

<style lang="postcss">
    section {
        @apply m-auto w-4/12 h-screen flex flex-col gap-6 justify-center items-center;

        :global(> input) {
            @apply font-content text-base placeholder:text-main-content text-main-content bg-main-color-hover ring-main-color border-none outline-none w-[25rem];
        }
    }
</style>
