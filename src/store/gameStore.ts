import { create } from 'zustand';
import { Character, Player, RoleKey, GamePhase } from '@/lib/types';
import { emptyTeam, ALL_ROLE_KEYS, countFilledRoles, TOTAL_ROLES } from '@/lib/roles';

interface GameState {
    phase: GamePhase;
    players: Player[];
    currentPlayerIndex: number;
    currentRound: number;
    availableCharacters: Character[];
    drawnCharacter: Character | null;

    setupGame: (names: string[], allChars: Character[]) => void;
    drawCard: () => void;
    assignRole: (roleKey: RoleKey) => void;
    useSkip: () => void;
    continueAfterRoundSummary: () => void;
    resetGame: () => void;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** true if every player's team is completely filled */
function allTeamsFull(players: Player[]): boolean {
    return players.every((p) => countFilledRoles(p.team) >= TOTAL_ROLES);
}

/** true if a player has at least one available role slot */
function playerHasAvailableSlot(player: Player): boolean {
    return ALL_ROLE_KEYS.some((k) => player.team[k] === null);
}

export const useGameStore = create<GameState>((set, get) => ({
    phase: 'setup',
    players: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    availableCharacters: [],
    drawnCharacter: null,

    setupGame: (names, allChars) => {
        const players: Player[] = names.map((name, i) => ({
            id: i,
            name: name.trim() || `Player ${i + 1}`,
            skipUsed: false,
            team: emptyTeam(),
        }));

        set({
            phase: 'playing',
            players,
            currentPlayerIndex: 0,
            currentRound: 1,
            availableCharacters: shuffle(allChars),
            drawnCharacter: null,
        });
    },

    drawCard: () => {
        const { drawnCharacter, availableCharacters } = get();
        if (drawnCharacter !== null) return;
        if (availableCharacters.length === 0) return;

        const idx = Math.floor(Math.random() * availableCharacters.length);
        const drawn = availableCharacters[idx];
        const remaining = availableCharacters.filter((_, i) => i !== idx);
        set({ drawnCharacter: drawn, availableCharacters: remaining });
    },

    assignRole: (roleKey) => {
        const { drawnCharacter, players, currentPlayerIndex } = get();
        if (!drawnCharacter) return;

        const currentPlayer = players[currentPlayerIndex];
        // Guard: slot must be empty
        if (currentPlayer.team[roleKey] !== null) return;

        const updatedPlayer: Player = {
            ...currentPlayer,
            team: { ...currentPlayer.team, [roleKey]: drawnCharacter },
        };
        const newPlayers = players.map((p, i) => (i === currentPlayerIndex ? updatedPlayer : p));

        set({ players: newPlayers, drawnCharacter: null });
        _advanceTurn(newPlayers, set, get);
    },

    useSkip: () => {
        const { drawnCharacter, players, currentPlayerIndex } = get();
        if (!drawnCharacter) return;

        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.skipUsed) return;

        const updatedPlayer: Player = { ...currentPlayer, skipUsed: true };
        const newPlayers = players.map((p, i) => (i === currentPlayerIndex ? updatedPlayer : p));

        set({ players: newPlayers, drawnCharacter: null });
        _advanceTurn(newPlayers, set, get);
    },

    continueAfterRoundSummary: () => {
        const { players, availableCharacters } = get();
        // Check if game is truly over
        if (allTeamsFull(players) || availableCharacters.length === 0) {
            set({ phase: 'summary' });
            return;
        }
        set({ phase: 'playing' });
    },

    resetGame: () => {
        set({
            phase: 'setup',
            players: [],
            currentPlayerIndex: 0,
            currentRound: 1,
            availableCharacters: [],
            drawnCharacter: null,
        });
    },
}));

/**
 * Advance to the next player's turn.
 * - If we've wrapped back to player 0 → show round summary
 * - If game over conditions are met → go to summary
 */
function _advanceTurn(
    players: Player[],
    set: (partial: Partial<GameState>) => void,
    get: () => GameState
) {
    const { currentPlayerIndex, currentRound, availableCharacters } = get();

    const nextIndex = (currentPlayerIndex + 1) % players.length;
    const roundComplete = nextIndex === 0; // wrapped back to start
    const nextRound = roundComplete ? currentRound + 1 : currentRound;

    // Check end: all teams full OR no characters left
    if (allTeamsFull(players) || availableCharacters.length === 0) {
        set({ currentPlayerIndex: nextIndex, currentRound: nextRound, phase: 'summary' });
        return;
    }

    if (roundComplete) {
        // After a full round → show round summary before continuing
        set({ currentPlayerIndex: 0, currentRound: nextRound, phase: 'round_summary' });
        return;
    }

    // Skip players whose team is already full (edge case)
    let idx = nextIndex;
    while (idx !== currentPlayerIndex && !playerHasAvailableSlot(players[idx])) {
        idx = (idx + 1) % players.length;
    }

    set({ currentPlayerIndex: idx, currentRound: nextRound });
}
