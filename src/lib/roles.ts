import { RoleKey, RoleSlot } from './types';

export const ROLE_DEFINITIONS: RoleSlot[] = [
    { key: 'captain', label: 'Captain', description: 'Leads the team into battle', icon: '👑' },
    { key: 'vice_captain', label: 'Vice-Captain', description: 'Second in command', icon: '⚔️' },
    { key: 'tank', label: 'Tank', description: 'Absorbs damage for the team', icon: '🛡️' },
    { key: 'healer', label: 'Healer', description: 'Restores health to allies', icon: '💊' },
    { key: 'assassin', label: 'Assassin', description: 'Strikes from the shadows', icon: '🗡️' },
    { key: 'support_1', label: 'Support 1', description: 'Assists allies in battle', icon: '🤝' },
    { key: 'support_2', label: 'Support 2', description: 'Second support for the team', icon: '🤝' },
    { key: 'traitor', label: 'Traitor', description: 'Hidden enemy within the team', icon: '🎭' },
];

export const ALL_ROLE_KEYS = ROLE_DEFINITIONS.map((r) => r.key);
export const TOTAL_ROLES = ROLE_DEFINITIONS.length; // 8

/** Build an empty team object (all roles unassigned) */
export function emptyTeam(): Record<RoleKey, null> {
    return Object.fromEntries(ALL_ROLE_KEYS.map((k) => [k, null])) as Record<RoleKey, null>;
}

export function getRoleByKey(key: RoleKey): RoleSlot | undefined {
    return ROLE_DEFINITIONS.find((r) => r.key === key);
}

/** How many roles a player has filled so far */
export function countFilledRoles(team: Record<RoleKey, unknown>): number {
    return ALL_ROLE_KEYS.filter((k) => team[k] !== null).length;
}
