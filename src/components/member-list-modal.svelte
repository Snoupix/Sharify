<script lang="ts">
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { toast } from "svelte-sonner";
	import { Circle, Crown, Swords, User } from "lucide-svelte";

	import Button from "$/components/button.svelte";
	import { get_user_role, sum_bytes } from "$lib/utils";
	import type { Room, RoomUser } from "$lib/proto/room";
	import type { Nullable } from "$lib/types";
	import { can_user_moderate_user } from "$lib/role_perms";
	import { send_ws_command } from "$lib/ws_impl";
	import type { Command_Ban, Command_Kick } from "$lib/proto/cmd";

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");

	const {
		sorted_users,
		current_user,
	}: {
		sorted_users: Array<RoomUser>;
		current_user: Nullable<RoomUser>;
	} = $props();

	// TODO Impl reason
	async function kick(user_id: Command_Kick["userId"], reason: Command_Kick["reason"] = "") {
		await send_ws_command({ kick: { userId: user_id, reason } });

		toast.success("User kicked out of the room");
	}

	// TODO Impl reason
	async function ban(user_id: Command_Ban["userId"], reason: Command_Ban["reason"] = "") {
		await send_ws_command({ ban: { userId: user_id, reason } });

		toast.success("User banned from the room");
	}
</script>

<div class="members">
	<ul>
		{#each sorted_users as user, i (user.id)}
			{@const previous_user = i - 1 >= 0 ? sorted_users.at(i - 1) : undefined}
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
						<span>{user.username}</span>
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
							<Button onclick={async () => await kick(user.id)}>Kick</Button>
							<Button onclick={async () => await ban(user.id)}>Ban</Button>
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
		@apply mx-auto flex w-full flex-col items-stretch justify-center gap-4 px-8;

		ul,
		li {
			@apply list-none;
		}

		ul {
			@apply flex flex-col gap-2;
		}

		.user {
			@apply flex flex-row items-center justify-between gap-4 rounded-md border border-main-hover bg-secondary/40 px-4 py-2 transition-colors duration-300;

			.left,
			.right {
				@apply flex flex-row gap-4 text-main-content;
			}

			span {
				@apply !text-main-content;
			}
		}

		.role-name {
			@apply my-4 flex flex-row items-center justify-center gap-2;

			p {
				@apply text-main-content;
			}

			hr {
				@apply w-full border-main-content;
			}
		}
	}
</style>
