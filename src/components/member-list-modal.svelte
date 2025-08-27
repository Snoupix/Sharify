<script lang="ts">
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { Circle, Crown, Swords, User } from "lucide-svelte";

    import Button from "$/components/button.svelte";
	import { get_user_role, sum_bytes } from "$lib/utils";
	import type { Room, RoomUser } from "$lib/proto/room";
	import type { Nullable } from "$/lib/types";
	import { can_user_moderate_user } from "$/lib/role_perms";

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");

    const {
        sorted_users,
        current_user,
    }: {
        sorted_users: Array<RoomUser>;
        current_user: Nullable<RoomUser>;
    } = $props();
</script>

<div class="members">
    <ul>
        {#each sorted_users as user, i (user.id)}
        {@const previous_user = sorted_users.at(i - 2)}
        <li>
            {#if previous_user === undefined || sum_bytes(previous_user.roleId) !== sum_bytes(user.roleId)}
                <div class="role-name">
                    <hr />
                    <p>{get_user_role($room_data, user.roleId)?.name ?? "Role not found"}</p>
                    <hr />
                </div>
            {/if}
            <div class="user">
                <div class="left">
                    {#if user.isConnected}
                        <Circle fill="#119302" color="#119302" class="w-4" />
                    {:else}
                        <Circle fill="#a20000" color="#a20000" class="w-4" />
                    {/if}
                    <span>{user.username} </span>
                    {#if get_user_role($room_data, user.roleId)?.permissions?.canManageRoom ?? false}
                        <span title="Owner">
                            <Crown class="w-4 stroke-main-content" />
                        </span>
                    {:else if get_user_role($room_data, user.roleId)?.permissions?.canManageUsers ?? false}
                        <span title="Moderator">
                            <Swords class="w-4 stroke-main-content" />
                        </span>
                    {:else}
                        <span title="User">
                            <User class="w-4 stroke-main-content" />
                        </span>
                    {/if}
                </div>
                <div class="right">
                    {#if current_user !== null && can_user_moderate_user($room_data, current_user, user)}
                        <Button>Kick</Button>
                        <Button>Ban</Button>
                    {/if}
                </div>
            </div>
        </li>
        {/each}
    </ul>
</div>

<style lang="postcss">
    @reference "$/app.css";

    .members {
        @apply w-full mx-auto flex flex-col items-stretch justify-center gap-4 px-8;

        ul, li {
            @apply list-none;
        }

        .user {
            @apply border border-main-hover bg-secondary/40 flex flex-row items-center justify-between gap-4 rounded-md px-4 py-2 transition-colors duration-300;

            .left, .right {
                @apply flex flex-row gap-4 text-main-content;
            }
        }

        .role-name {
            @apply my-4 flex flex-row justify-center items-center gap-2;

            p {
                @apply text-main-content;
            }

            hr {
                @apply w-full border-main-content;
            }
        }
    }
</style>
