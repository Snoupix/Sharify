<script lang="ts">
	import { toast } from "svelte-sonner";
	import { getContext } from "svelte";
	import { Circle, Crown, Swords, User, X } from "lucide-svelte";
	import type { Writable } from "svelte/store";

    import { get_user_role } from "$lib/utils";
    import { send_ws_command } from "$lib/ws_impl";
    import RoleManagerModal from "$/components/role-manager-modal.svelte";
    import MemberListModal from "$/components/member-list-modal.svelte";
    import CustomButton from "$/components/button.svelte";
	import type { Nullable } from "$lib/types";
	import type { Room, RoomUser } from "$lib/proto/room";
	import { sort_users_per_roles } from "$/lib/role_perms";

	const ETab = {
		Members: 0,
		Roles: 1,
	} as const;

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");

    const {
        is_skeleton,
        current_user,
        on_cmd_send_error,
    }: {
        is_skeleton: boolean;
        current_user: RoomUser;
        on_cmd_send_error: () => Promise<void>;
    } = $props();

	let displayed_modal_tab: (typeof ETab)[keyof typeof ETab] = $state(ETab.Members);
    let show_modal = $state(false);
    let is_mod = $derived(get_user_role($room_data, current_user.roleId)?.permissions?.canManageUsers ?? false);
    let sorted_users = $derived(sort_users_per_roles($room_data));

	async function kick_user(u: RoomUser) {
		await send_ws_command({
            kick: {
                userId: u.id,
                reason: "Unknown",
            }
        }, on_cmd_send_error);

        toast("User kicked out of the room");
	}

	async function ban_user(u: RoomUser) {
		await send_ws_command({
            ban: {
                userId: u.id,
                reason: "Unknown",
            }
        }, on_cmd_send_error);

        toast("User banned from the room");
	}
</script>

{#if is_skeleton}
<div class="song-queue">
</div>
{:else}
<div class="users">
    <div class="title">
        <h1><User /> Members{($room_data?.users ?? []).length !== 0 ? ` (${($room_data?.users ?? []).length})` : null}</h1>
    </div>
    <!-- TODO This is gonna be used on the modal, not room view
    {#each sorted_users as user, i (user.id)}
        {@const previous_user = sorted_users.at(i - 2)}
        {#if previous_user === undefined || sum_bytes(previous_user.roleId) !== sum_bytes(user.roleId)}
            <div class="role_name">
                <p>{get_user_role($room_data, user.roleId)?.name ?? "Role not found"}</p>
            </div>
        {/if}
        <div class="user">
            {#if user.isConnected}
                <Circle fill="#119302" color="#119302" class="w-4" />
            {:else}
                <Circle fill="#a20000" color="#a20000" class="w-4" />
            {/if}
            <div class="col">
                <div>
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
            </div>
        </div> -->
    {#each sorted_users as user, i (user.id)}
        <!-- TODO: Later, use <BadgeCheck /> for premium users -->
        <div
            role="button"
            tabindex={i}
            class="user"
            class:can-manage={is_mod}
            onkeydown={e => e.key === " " ? (show_modal = true) : null}
            onclick={() => is_mod ? (show_modal = true) : null}>
            {#if user.isConnected}
                <Circle fill="#119302" color="#119302" class="w-4" />
            {:else}
                <Circle fill="#a20000" color="#a20000" class="w-4" />
            {/if}
            <div class="col">
                <div>
                    <!-- TODO On member click, modal tab members -->
                    <span>{user.username} </span>
                    <!-- TODO On role click, modal tab roles -->
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
                <p>{get_user_role($room_data, user.roleId)?.name ?? "Role not found"}</p>
            </div>
        </div>
    {/each}

    {#if show_modal}
        <div class="modal">
            <div class="inner-modal">
                <button class="close-btn" onclick={() => show_modal = false}>
                    <X class="w-12 h-12" />
                </button>
                <div class="layout">
                    <div class="tabs">
                        <button
                            class:active={displayed_modal_tab == ETab.Members}
                            onclick={() => (displayed_modal_tab = ETab.Members)}
                        >Members</button>
                        <button
                            class:active={displayed_modal_tab == ETab.Roles}
                            onclick={() => (displayed_modal_tab = ETab.Roles)}
                        >Roles</button>
                    </div>
                    {#if displayed_modal_tab === ETab.Members}
                        <MemberListModal {sorted_users} {current_user} />
                    {:else if displayed_modal_tab === ETab.Roles}
                        <RoleManagerModal {current_user} />
                    {:else}
                        unhandled
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
{/if}

<style lang="postcss">
    @reference "$/app.css";

    .users {
        @apply flex flex-col items-start justify-start gap-4 px-4;

        .title {
            @apply w-full h-2/12;

            h1, :global(.h1) {
                @apply mt-4 ml-2 flex flex-row justify-start items-center gap-4 uppercase font-bold;
            }
        }

        .user {
            @apply border border-main-hover bg-secondary/40 w-[-moz-available] flex flex-row items-center justify-start gap-4 rounded-md px-4 py-2 transition-colors duration-300;

            .col {
                @apply flex flex-col justify-start items-start gap-2;

                div {
                    @apply flex flex-row items-center justify-start gap-2;
                }

                p, span {
                    @apply font-content text-main-content;
                }

                p:last-child {
                    @apply text-sm rounded-full bg-bg px-4 py-1;
                }
            }

            &.can-manage {
                @apply hover:bg-secondary/20 cursor-pointer;
            }
        }

        .modal {
            @apply z-11 absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center backdrop-blur-lg;

            .inner-modal {
                @apply relative w-5/12 h-9/12 bg-bg border border-main rounded-xl overflow-y-scroll px-6;

                .close-btn {
                    @apply sticky top-4 right-4 float-right cursor-pointer;
                }

                .layout {
                    @apply my-8 w-full flex flex-col justify-center items-center gap-6;

                    .tabs {
                        @apply p-2 h-3/12 flex flex-row justify-center items-center gap-4 overflow-hidden;

                        button, :global(.s-btn) {
                            @apply rounded-xl px-4 py-2 hover:bg-secondary/40 cursor-pointer;

                            &.active {
                                @apply text-main-content bg-secondary/40;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
