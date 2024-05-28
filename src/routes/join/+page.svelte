<script lang="ts">
    import Logo from "$/components/logo.svelte";
    import { Input } from "$/components/ui/input";
    import CustomButton from "$/components/button.svelte";
    import { goto } from "$app/navigation";

    let room_id = "";
    let room_password = "";
    let error = "";

    async function join_party() {
        if (room_id.trim() == "" || room_password.trim() == "") {
            error = "Party ID and Party password must not be empty";
            return;
        }

        await goto(`/join/${room_id}/${room_password}`);
    }
</script>

<section>
    <Logo class_extension="mb-4" />
    <Input type="text" placeholder="Party ID" bind:value={room_id} />
    <Input type="text" placeholder="Party password" bind:value={room_password} />
    {#if error != ""}
        <span class="text-red-500">{error}</span>
    {/if}
    <CustomButton on:click={join_party}>Join party</CustomButton>
</section>

<style lang="postcss">
    section {
        @apply m-auto w-4/12 h-screen flex flex-col gap-6 justify-center items-center;

        :global(> input) {
            @apply font-content text-base placeholder:text-main-content text-main-content bg-main-color-hover ring-main-color border-none outline-none w-[25rem];
        }
    }
</style>
