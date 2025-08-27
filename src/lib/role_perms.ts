import { get_user_role } from "$lib/utils";
import type { Room, RoomUser } from "$lib/proto/room";
import type { Role, RolePermission } from "$lib/proto/role";
import type { Nullable } from "$lib/types";

export const PERM_TO_INT: Record<keyof RolePermission, number> = {
    canUseControls: 0,
    canAddSong: 1,
    // Mod like
    canManageUsers: 2,
    // Admin like
    canAddModerator: 3,
    // Owner(s)
    canManageRoom: 4,
} as const;

export function role_to_hierarchy(perms: Nullable<Role> | undefined) {
    return (Object.entries(perms?.permissions ?? {}) as Array<[keyof RolePermission, RolePermission[keyof RolePermission]]>)
        .filter(([, has]) => has)
        .map(([str]) => PERM_TO_INT[str])
        .reduce((acc, i) => acc + i, 0);
}

export function sort_users_per_roles(room_data: Nullable<Room>) {
    return room_data?.users.sort((a, b) => {
        const a_perms = role_to_hierarchy(get_user_role(room_data, a.roleId));
        const b_perms = role_to_hierarchy(get_user_role(room_data, b.roleId));

        return b_perms - a_perms;
    }) ?? [];
}

export function sort_roles(room_data: Nullable<Room>) {
    return room_data?.roleManager?.roles.sort((a, b) => {
        const a_perms = role_to_hierarchy(a);
        const b_perms = role_to_hierarchy(b);

        return b_perms - a_perms;
    }) ?? [];
}

export function can_user_moderate_user(room_data: Nullable<Room>, mod: Nullable<RoomUser>, target: RoomUser) {
    if (!room_data || !mod) return false;

    const mod_role = get_user_role(room_data, mod.roleId);
    const target_role = get_user_role(room_data, target.roleId);

    if (!mod_role || !target_role) return false;

    // TODO Check if those are the right perms ?
    if (!mod_role.permissions?.canManageUsers && !mod_role.permissions?.canManageRoom && !mod_role.permissions?.canAddModerator) {
        return false;
    }

    return role_to_hierarchy(mod_role) > role_to_hierarchy(target_role);
}

export function can_user_manage_role(room_data: Nullable<Room>, current_user: Nullable<RoomUser>, role: Role) {
    if (!room_data || !current_user) return false;

    const user_role = get_user_role(room_data, current_user.roleId);

    if (!user_role) return false;

    // TODO Check if those are the right perms ?
    if (!user_role.permissions?.canAddModerator && ! user_role.permissions?.canManageUsers) {
        return false;
    }

    return role_to_hierarchy(user_role) > role_to_hierarchy(role);
}
