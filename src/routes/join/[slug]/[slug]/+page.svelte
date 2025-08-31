<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import Button from "$/components/button.svelte";
    import { LoaderCircle } from "lucide-svelte";

	import { PUBLIC_SERVER_ADDR_DEV } from "$env/static/public";
    import type { PageProps } from "./$types";
    import { bytes_to_uuid_str, get_storage_value, leave_room, set_storage_value } from "$lib/utils";
	import { CommandResponse, HttpCommand } from "$lib/proto/cmd";
	import { roomErrorFromJSON, roomErrorToJSON } from "$lib/proto/room";

    const { data }: PageProps = $props();

    let username = $state("");
    let is_loading = $state(false);
    let error = $state("");

    onMount(async () => {
        if (!data || !data.room) {
            console.log(data);
            toast.error("Error: Room not found");
            return await leave_room();
        }

        if (data.session?.user?.name) {
            username = data.session.user.name;
        }
    });

    async function join_room() {
        is_loading = true;

        if (username.trim().length === 0) {
            error = "Your username must be filled";
            is_loading = false;
            return;
        }

        const user_id = get_storage_value("user_id");

        if (user_id === null) {
            toast("Unexpected error: You're not logged in");
            return await leave_room();
        }

		const command: HttpCommand = {
            joinRoom: {
                roomId: data.room.id,
                username,
                userId: user_id,
            }
		};

		const bytes = HttpCommand.encode(command).finish();

		const res = await fetch(`${PUBLIC_SERVER_ADDR_DEV}/v1`, {
			method: "POST",
            headers: {
                "Content-Type": "application/protobuf",
            },
			body: bytes as BodyInit,
		});

		if (res.status !== 200 || res.body === null) {
			console.error(res);
		}

        const res_bytes = await res.bytes();

        try {
            let res_cmd = CommandResponse.decode(res_bytes);

            if (res_cmd.room === undefined) {
                console.error(res_cmd);
                // TODO: Switch on FromJSON for proper string error
                toast.error(`An error occured while joining the room. ${res_cmd.genericError ?? roomErrorToJSON(roomErrorFromJSON(res_cmd.roomError))}`);
                return;
            }

            set_storage_value({ user: res_cmd.room.users.find(u => u.username === username)!, current_room: res_cmd.room });

            toast(`You successfully joined room "${res_cmd.room.name}"!`);

            await goto(`/room/${bytes_to_uuid_str(res_cmd.room.id)}`);
        } catch (e: unknown) {
            console.error(e);
            toast.error(`An error occured while joining the room. ${e}`);
            is_loading = false;
        }
    }
</script>

{#if data && data.room}
    <section>
        <span>What's your username ?</span>
        <input
            onkeydown={k => k.key === "Enter" && join_room()}
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
        <Button onclick={join_room}>Join the party</Button>
    </section>
{/if}

<style lang="postcss">
    @reference "$/app.css";

    section {
        @apply w-2/12 h-screen m-auto flex flex-col justify-center items-center gap-6;
    }
</style>
