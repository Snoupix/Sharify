<script lang="ts">
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";
	import type { Writable } from "svelte/store";
	import { toast } from "svelte-sonner";
	import { Check, ChevronDown } from "lucide-svelte";
	import { Select } from "bits-ui";

	import Button from "$/components/button.svelte";
	import { can_user_manage_role, sort_roles } from "$lib/role_perms";
	import { get_user_role, sum_bytes } from "$lib/utils";
	import type { Room, RoomUser } from "$lib/proto/room";
	import type { Nullable } from "$lib/types";
	import type { RolePermission } from "$lib/proto/role";
	import { send_ws_command } from "$/lib/ws_impl";

	const ROLE_DISPLAY: Record<keyof RolePermission, string> = {
		canAddModerator: "Add moderators",
		canManageRoom: "Manage room",
		canManageUsers: "Manage users",
		canAddSong: "Add songs",
		canUseControls: "Use controls",
	};

	const MIN_ROLE_NAME = 2;
	const MAX_ROLE_NAME = 10;

	const room_data: Writable<Nullable<Room>> = getContext("RoomData");

	let role_rename = $state({
		name: "",
		i: -1,
	});
	// sorted_roles is updated internally when updating role perms but its dependant on $room_data
	// because so to avoid overriding possible changes, when $room_data updates, a toast will inform
	// the mod telling to refresh its state manually if s.he wants latests data
	let sorted_roles = $state(sort_roles($room_data));
	let new_role: { name: string; permissions: RolePermission } = $state({
		name: "",
		permissions: {
			canAddModerator: false,
			canManageRoom: false,
			canManageUsers: false,
			canAddSong: false,
			canUseControls: false,
		},
	});
	let new_role_perms = $derived(
		(Object.entries(new_role.permissions) as Array<[keyof RolePermission, boolean]>)
			.filter(([, b]) => b)
			.map(([p]) => ROLE_DISPLAY[p])
			.join(" / "),
	);

	const {
		current_user,
	}: {
		current_user: Nullable<RoomUser>;
	} = $props();

	function perms_iter(perms: RolePermission) {
		return (Object.keys(perms) as Array<keyof RolePermission>).filter((k) => {
			const role = get_user_role($room_data, current_user!.roleId);

			return role !== null ? role.permissions![k] : false;
		});
	}

	function validate_role_name(name: string) {
		if (name.length < MIN_ROLE_NAME || name.length > MAX_ROLE_NAME) {
			return false;
		}

		return true;
	}

	async function create_role() {
		const name = new_role.name.trim();

		if (!validate_role_name(name)) {
			toast.error(`The new Role name must be between ${MIN_ROLE_NAME} and ${MAX_ROLE_NAME} characters`);
			return;
		}

		await send_ws_command({ createRole: { name, permissions: new_role.permissions } });
	}

	async function rename_role() {
		const name = role_rename.name.trim();
		const role = sorted_roles.find((_, i) => i === role_rename.i);

		role_rename = { name: "", i: -1 };

		if (!validate_role_name(name)) {
			toast.error(`The Role name must be between ${MIN_ROLE_NAME} and ${MAX_ROLE_NAME} characters`);
			return;
		}

		if (!role) {
			toast.error("Unexpected error: Role not found while renaming");
			return;
		}

		$room_data?.roleManager?.roles.forEach((r) => {
			if (sum_bytes(r.id) !== sum_bytes(role.id)) {
				return;
			}

			r.name = name;
		});

		await send_ws_command({ renameRole: { name, roleId: role.id } });
	}

	async function delete_role(id: Uint8Array<ArrayBufferLike>) {
		await send_ws_command({ deleteRole: id });
	}

	async function set_role_perms() {
		// TODO: Empty sorted_roles right after send ? So the received room state can be re-used to set proper data automatically
		// And keep a clone to rollback on cmd fail ?
		// await send_ws_command({ setRolePermissions: false });
	}
</script>

{#snippet manage_role_perms(trigger_snippet: Snippet, perm_obj_ref: RolePermission)}
	<Select.Root
		type="multiple"
		value={Object.entries(perm_obj_ref)
			.filter(([, bool]) => bool)
			.map(([key]) => key)}
		onValueChange={(selected_perms) => {
			for (const perm of Object.keys(perm_obj_ref) as Array<keyof RolePermission>) {
				perm_obj_ref[perm] = selected_perms.includes(perm);
			}
		}}
		onOpenChange={async (open) => {
			if (open) return;

			await set_role_perms();
		}}>
		<Select.Trigger>
			{@render trigger_snippet()}
		</Select.Trigger>
		<Select.Portal>
			<Select.Content
				class="z-12 flex flex-col items-center justify-start gap-2 overflow-x-hidden rounded-xl border border-main bg-bg">
				<Select.Viewport class="p-1">
					{#each perms_iter(perm_obj_ref) as perm, i (i)}
						<Select.Item
							value={perm}
							class="flex w-full cursor-pointer flex-row items-center justify-start gap-2 px-4 py-2 hover:scale-105">
							{#if perm_obj_ref[perm]}
								<Check />
							{/if}
							{ROLE_DISPLAY[perm]}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
{/snippet}

{#snippet new_role_perms_trigger()}
	<Button
		title={new_role_perms}
		class_extended="block-ruby text-main-content w-full overflow-x-hidden text-ellipsis text-nowrap">
		Permissions {new_role_perms}
		<ChevronDown class="stroke-main-content" />
	</Button>
{/snippet}

{#snippet role_perms_trigger()}
	<Button class_extended="flex flex-row justify-center items-center gap-2"
		>Permissions<ChevronDown class="stroke-main-content" /></Button>
{/snippet}

<div class="roles">
	<div class="create-role">
		{@render manage_role_perms(new_role_perms_trigger, new_role.permissions)}
		<input bind:value={new_role.name} placeholder="Role name" type="text" />
		<Button onclick={create_role}>Create</Button>
	</div>
	<ul>
		{#each sorted_roles as role, i (sum_bytes(role.id))}
			<li>
				<div class="role">
					<div class="left">
						{#if role_rename.i === i}
							<input type="text" bind:value={role_rename.name} />
						{:else}
							<input disabled={true} type="text" value={role.name} />
						{/if}
					</div>
					<div class="right">
						{#if can_user_manage_role($room_data, current_user, role)}
							{#if role_rename.i === i}
								<Button onclick={rename_role}>Confirm</Button>
							{:else}
								{@render manage_role_perms(role_perms_trigger, sorted_roles[i].permissions!)}
								<Button
									onclick={() => {
										role_rename.i = i;
										role_rename.name = role.name;
									}}>
									Rename
								</Button>
							{/if}
							{#if role_rename.i === i}
								<Button
									onclick={() => {
										role_rename.i = -1;
										role_rename.name = "";
									}}>
									Cancel
								</Button>
							{/if}
							<Button onclick={() => delete_role(role.id)}>Delete</Button>
						{:else}
							<span class="!text-main-content">You cannot manage this role</span>
						{/if}
					</div>
				</div>
				<!-- <div class="role"> -->
				<!--     <div class="left"> -->
				<!--         {#if role.isConnected} -->
				<!--             <Circle fill="#119302" color="#119302" class="w-4" /> -->
				<!--         {:else} -->
				<!--             <Circle fill="#a20000" color="#a20000" class="w-4" /> -->
				<!--         {/if} -->
				<!--         <span>{role.username} </span> -->
				<!--         {#if get_user_role($room_data, role.roleId)?.permissions?.canManageRoom ?? false} -->
				<!--             <span title="Owner"> -->
				<!--                 <Crown class="w-4 stroke-main-content" /> -->
				<!--             </span> -->
				<!--         {:else if get_user_role($room_data, role.roleId)?.permissions?.canManageUsers ?? false} -->
				<!--             <span title="Moderator"> -->
				<!--                 <Swords class="w-4 stroke-main-content" /> -->
				<!--             </span> -->
				<!--         {:else} -->
				<!--             <span title="User"> -->
				<!--                 <User class="w-4 stroke-main-content" /> -->
				<!--             </span> -->
				<!--         {/if} -->
				<!--     </div> -->
				<!--     <div class="right"> -->
				<!--         {#if current_user !== null && can_user_moderate_user($room_data, current_user, role)} -->
				<!--             <Button>Kick</Button> -->
				<!--             <Button>Ban</Button> -->
				<!--         {/if} -->
				<!--     </div> -->
				<!-- </div> -->
			</li>
		{/each}
	</ul>
</div>

<style lang="postcss">
	@reference "$/app.css";

	.roles {
		@apply mx-auto flex w-full flex-col items-stretch justify-center gap-4 px-8;

		ul,
		li {
			@apply list-none;
		}

		ul {
			@apply flex flex-col items-stretch justify-center gap-2;
		}

		.role {
			@apply flex flex-row items-center justify-between gap-4 rounded-md border border-main-hover bg-secondary/40 px-4 py-2 transition-colors duration-300;

			.left,
			.right {
				@apply flex w-3/6 flex-row items-center gap-4 text-main-content;
			}

			.left {
				@apply justify-start;

				input {
					@apply text-main-content disabled:font-bold;
				}
			}

			.right {
				@apply justify-end;
			}
		}

		.create-role {
			@apply flex w-full flex-row items-center justify-start gap-4;

			:global(> *) {
				@apply w-1/3;
			}
		}
	}
</style>
