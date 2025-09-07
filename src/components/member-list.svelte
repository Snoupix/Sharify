<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
	import { Circle, Crown, RefreshCcw, Swords, User, X } from "lucide-svelte";
	import type { Unsubscriber, Writable } from "svelte/store";

	import { get_user_role } from "$lib/utils";
	import RoleManagerModal from "$/components/role-manager-modal.svelte";
	import MemberListModal from "$/components/member-list-modal.svelte";
	import { Skeleton } from "$/components/ui/skeleton";
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
	}: {
		is_skeleton: boolean;
		current_user: RoomUser;
	} = $props();

	let displayed_modal_tab: (typeof ETab)[keyof typeof ETab] = $state(ETab.Members);
	let show_modal = $state(false);
	let is_mod = $derived(get_user_role($room_data, current_user.roleId)?.permissions?.canManageUsers ?? false);
	let sorted_users = $derived(sort_users_per_roles($room_data));
	let room_data_sub: Nullable<Unsubscriber> = $state(null);
	let can_refresh_role_state = $state(false);
	let rerender_roles_key = $state(false);

	onMount(() => {
		room_data_sub = room_data.subscribe(() => {
			can_refresh_role_state = true;
		});
	});

	onDestroy(() => room_data_sub?.());

	function rerender_roles() {
		rerender_roles_key = !rerender_roles_key;
		can_refresh_role_state = false;
	}
</script>

{#if is_skeleton}
	<div class="users">
		<div class="title">
			<Skeleton class="h1 h-4 w-48" />
		</div>
	</div>
{:else}
	<div class="users">
		<div class="title">
			<h1>
				<User /> Members{($room_data?.users ?? []).length !== 0
					? ` (${($room_data?.users ?? []).length})`
					: null}
			</h1>
		</div>
		{#each sorted_users as user, i (user.id)}
			<!-- TODO: Later, use <BadgeCheck /> for premium users -->
			<div
				role="button"
				tabindex={i}
				class="user"
				class:can-manage={is_mod}
				onkeydown={(e) => (e.key === " " ? (show_modal = true) : null)}
				onclick={() => (is_mod ? (show_modal = true) : null)}>
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
					<button class:hidden={!can_refresh_role_state} class="refresh-btn" onclick={rerender_roles}>
						<RefreshCcw class="h-12 w-12 stroke-main-hover" />
					</button>
					<button class="close-btn" onclick={() => (show_modal = false)}>
						<X class="h-12 w-12 stroke-main-hover" />
					</button>
					<div class="layout">
						<div class="tabs">
							<button
								class:active={displayed_modal_tab == ETab.Members}
								onclick={() => (displayed_modal_tab = ETab.Members)}>Members</button>
							<button
								class:active={displayed_modal_tab == ETab.Roles}
								onclick={() => (displayed_modal_tab = ETab.Roles)}>Roles</button>
						</div>
						{#if displayed_modal_tab === ETab.Members}
							<MemberListModal {sorted_users} {current_user} />
						{:else if displayed_modal_tab === ETab.Roles}
							{#key rerender_roles_key}
								<RoleManagerModal {current_user} />
							{/key}
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
			@apply h-2/12 w-full;

			h1,
			:global(.h1) {
				@apply mt-4 ml-2 flex flex-row items-center justify-start gap-4 font-bold uppercase;
			}
		}

		.user {
			@apply flex w-[-moz-available] flex-row items-center justify-start gap-4 rounded-md border border-main-hover bg-secondary/40 px-4 py-2 transition-colors duration-300;

			.col {
				@apply flex flex-col items-start justify-start gap-2;

				div {
					@apply flex flex-row items-center justify-start gap-2;
				}

				p,
				span {
					@apply font-content text-main-content;
				}

				p:last-child {
					@apply rounded-full bg-bg px-4 py-1 text-sm;
				}
			}

			&.can-manage {
				@apply cursor-pointer hover:bg-secondary/20;
			}
		}

		.modal {
			@apply absolute top-0 left-0 z-11 flex h-screen w-full flex-col items-center justify-center backdrop-blur-lg;

			.inner-modal {
				@apply relative h-9/12 w-5/12 overflow-y-scroll rounded-xl border border-main bg-bg px-6;

				.refresh-btn {
					@apply sticky top-4 left-4 float-left cursor-pointer;
				}

				.close-btn {
					@apply sticky top-4 right-4 float-right cursor-pointer;
				}

				.layout {
					@apply my-8 flex w-full flex-col items-center justify-center gap-6;

					.tabs {
						@apply flex h-3/12 flex-row items-center justify-center gap-4 overflow-hidden p-2;

						button,
						:global(.s-btn) {
							@apply cursor-pointer rounded-xl px-4 py-2 hover:bg-secondary/40;

							&.active {
								@apply bg-secondary/40 text-main-content;
							}
						}
					}
				}
			}
		}
	}
</style>
