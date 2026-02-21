export type GamePhase = 'setup' | 'playing' | 'round_summary' | 'summary';

export type RoleKey =
  | 'captain'
  | 'vice_captain'
  | 'tank'
  | 'healer'
  | 'assassin'
  | 'support_1'
  | 'support_2'
  | 'traitor';

export interface Character {
  id: number;
  name: string;
  image: string;
  used: boolean;
}

export interface Assignment {
  character: Character;
  role: RoleKey;
}

/** Each player is also a team — they each have their own 8 role slots */
export interface Player {
  id: number;
  name: string;
  skipUsed: boolean;
  /** The player's team: role key → assigned character (or null) */
  team: Record<RoleKey, Character | null>;
}

export interface RoleSlot {
  key: RoleKey;
  label: string;
  description: string;
  icon: string;
}
