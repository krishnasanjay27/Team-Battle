'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Player, RoleKey } from '@/lib/types';
import { useGameStore } from '@/store/gameStore';
import { playRoundSummary } from '@/lib/sounds';

// ── Battle Role Definitions ──────────────────────────────────────────────────
export type StatKey = 'Traitor' | 'Support' | 'Assassin' | 'Healer' | 'Tank' | 'ViceCaptain' | 'Captain';

export interface BattleRole {
    roleKey: RoleKey;
    statKey: StatKey;
    label: string;
    icon: string;
    inverted: boolean;
    color: string;
    description: string;
    winnerBonus: number; // extra pts added to N for the round winner
}

export const BATTLE_ROLES: BattleRole[] = [
    { roleKey: 'traitor', statKey: 'Traitor', label: 'TRAITOR', icon: '🎭', inverted: true, color: '#fb923c', description: 'The hidden enemy — lower stat wins', winnerBonus: 0 },
    { roleKey: 'support_1', statKey: 'Support', label: 'SUPPORT 1', icon: '🤝', inverted: false, color: '#38bdf8', description: 'First support — higher stat wins', winnerBonus: 0 },
    { roleKey: 'support_2', statKey: 'Support', label: 'SUPPORT 2', icon: '🤝', inverted: false, color: '#22d3ee', description: 'Second support — higher stat wins', winnerBonus: 0 },
    { roleKey: 'assassin', statKey: 'Assassin', label: 'ASSASSIN', icon: '🗡️', inverted: false, color: '#f87171', description: 'Strike from the shadows — higher stat wins', winnerBonus: 1 },
    { roleKey: 'healer', statKey: 'Healer', label: 'HEALER', icon: '💊', inverted: false, color: '#34d399', description: 'Restore the team — higher stat wins', winnerBonus: 2 },
    { roleKey: 'tank', statKey: 'Tank', label: 'TANK', icon: '🛡️', inverted: false, color: '#60a5fa', description: 'Absorb all damage — higher stat wins', winnerBonus: 3 },
    { roleKey: 'vice_captain', statKey: 'ViceCaptain', label: 'VICE-CAPTAIN', icon: '⚔️', inverted: false, color: '#a78bfa', description: 'Second in command — higher stat wins', winnerBonus: 4 },
    { roleKey: 'captain', statKey: 'Captain', label: 'CAPTAIN', icon: '👑', inverted: false, color: '#fbbf24', description: 'Lead the charge — higher stat wins', winnerBonus: 5 },
];

// ── Scoring Logic ─────────────────────────────────────────────────────────────
interface PlayerEntry {
    player: Player;
    statValue: number;
}

export function computeRolePoints(
    entries: PlayerEntry[],
    inverted: boolean,
    winnerBonus: number,
    N: number
): Map<number, number> {
    // Sort: inverted = ascending (lower = better), normal = descending (higher = better)
    const sorted = [...entries].sort((a, b) =>
        inverted ? a.statValue - b.statValue : b.statValue - a.statValue
    );

    const pointMap = new Map<number, number>();
    let i = 0;
    while (i < sorted.length) {
        // Find the full tie group
        let j = i;
        while (j < sorted.length - 1 && sorted[j + 1].statValue === sorted[i].statValue) j++;
        // Rank 0 (winner/s) gets N + winnerBonus; all other ranks get N - i
        const pts = i === 0 ? N + winnerBonus : N - i;
        for (let k = i; k <= j; k++) {
            pointMap.set(sorted[k].player.id, pts);
        }
        i = j + 1;
    }
    return pointMap;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Scoreboard({ players, currentPoints }: { players: Player[]; currentPoints: Map<number, number> | null }) {
    // Keep original player order — no sort
    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
        }}>
            {players.map((p, idx) => {
                const earned = currentPoints?.get(p.id);
                return (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '10px 18px',
                            textAlign: 'center',
                            minWidth: '110px',
                            position: 'relative',
                        }}
                    >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Inter', marginBottom: '2px' }}>
                            {p.name}
                        </div>
                        <div style={{
                            fontFamily: 'Cinzel, serif',
                            fontWeight: '900',
                            fontSize: '22px',
                            color: 'var(--accent-gold)',
                            lineHeight: 1,
                        }}>
                            {p.score}
                        </div>
                        {earned !== undefined && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-8px',
                                    background: 'linear-gradient(135deg, #34d399, #059669)',
                                    borderRadius: '20px',
                                    padding: '2px 7px',
                                    fontSize: '11px',
                                    fontFamily: 'Cinzel',
                                    fontWeight: '700',
                                    color: 'white',
                                }}
                            >
                                +{earned}
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}

interface CharacterCardProps {
    player: Player;
    roleKey: RoleKey;
    statKey: StatKey;
    statValue: number;
    roleColor: string;
    rank: number;
    points: number;
    N: number;
    inverted: boolean;
    revealed: boolean;
    index: number;
}

function CharacterCard({ player, roleKey, statValue, roleColor, rank, points, N, revealed, index }: CharacterCardProps) {
    const char = player.team[roleKey];
    const hasImage = char && char.image && char.image.trim() !== '';

    const rankLabel = rank === 0 ? (N === 1 ? '🥇' : '🥇') : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.12, type: 'spring', damping: 15, stiffness: 120 }}
            style={{
                flex: '1 1 200px',
                maxWidth: '260px',
                background: 'rgba(255,255,255,0.04)',
                border: `2px solid ${roleColor}40`,
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: `0 8px 32px ${roleColor}20`,
            }}
        >
            {/* Player name header */}
            <div style={{
                padding: '10px 14px',
                background: `${roleColor}15`,
                borderBottom: `1px solid ${roleColor}30`,
                fontFamily: 'Cinzel, serif',
                fontWeight: '700',
                fontSize: '13px',
                color: roleColor,
                textAlign: 'center',
                letterSpacing: '0.08em',
            }}>
                {player.name}
            </div>

            {/* Character image */}
            <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3/4',
                background: hasImage ? undefined : 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {hasImage ? (
                    <Image
                        src={char!.image}
                        alt={char!.name}
                        fill
                        sizes="260px"
                        style={{ objectFit: 'cover', objectPosition: 'top' }}
                    />
                ) : (
                    <span style={{ fontSize: '48px', opacity: 0.3 }}>🃏</span>
                )}
                {/* Stat overlay */}
                <AnimatePresence>
                    {revealed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.12 + 0.3, type: 'spring', damping: 12 }}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.85)',
                                border: `2px solid ${roleColor}`,
                                borderRadius: '12px',
                                padding: '6px 12px',
                                fontFamily: 'Cinzel, serif',
                                fontWeight: '900',
                                fontSize: '24px',
                                color: roleColor,
                                boxShadow: `0 0 16px ${roleColor}60`,
                            }}
                        >
                            {statValue}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rank badge */}
                <AnimatePresence>
                    {revealed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.12 + 0.5 }}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                background: 'rgba(0,0,0,0.85)',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontFamily: 'Cinzel, serif',
                                fontWeight: '700',
                                fontSize: '13px',
                                color: 'white',
                            }}
                        >
                            {rankLabel} · +{points}pts
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Character name */}
            <div style={{
                padding: '10px 14px',
                textAlign: 'center',
                borderTop: `1px solid ${roleColor}20`,
            }}>
                <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                }}>
                    {char?.name ?? 'No character'}
                </div>
                {revealed && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                        Stat: <span style={{ color: roleColor, fontWeight: '600' }}>{statValue}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoleComparison() {
    const { players, battleRoleIndex, submitRoleScore } = useGameStore();
    const battleRole = BATTLE_ROLES[battleRoleIndex];
    const [revealed, setRevealed] = useState(false);
    const [scored, setScored] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Map<number, number> | null>(null);
    const audioRef = useRef<boolean>(false);

    // Reset reveal state when role changes
    useEffect(() => {
        setRevealed(false);
        setScored(false);
        setCurrentPoints(null);
        audioRef.current = false;
    }, [battleRoleIndex]);

    if (!battleRole) return null;

    const { roleKey, statKey, label, icon, inverted, color, description, winnerBonus } = battleRole;

    // Build entries
    const entries: PlayerEntry[] = players.map((p) => {
        const char = p.team[roleKey];
        const statValue = char?.stats?.[statKey] ?? 0;
        return { player: p, statValue };
    });

    // Sorted for ranking (used after reveal)
    const sortedEntries = [...entries].sort((a, b) =>
        inverted ? a.statValue - b.statValue : b.statValue - a.statValue
    );

    // Get rank index for each player (after sorting)
    function getRankOf(playerId: number): number {
        for (let i = 0; i < sortedEntries.length;) {
            let j = i;
            while (j < sortedEntries.length - 1 && sortedEntries[j + 1].statValue === sortedEntries[i].statValue) j++;
            if (sortedEntries.slice(i, j + 1).some(e => e.player.id === playerId)) return i;
            i = j + 1;
        }
        return 0;
    }

    const handleReveal = () => {
        setRevealed(true);
        const pts = computeRolePoints(entries, inverted, winnerBonus, players.length);
        setCurrentPoints(pts);
        if (!audioRef.current) {
            audioRef.current = true;
            playRoundSummary();
        }
    };

    const handleNext = () => {
        if (scored) return;
        setScored(true);
        const pts = currentPoints ?? computeRolePoints(entries, inverted, winnerBonus, players.length);
        const record: Record<number, number> = {};
        pts.forEach((v, k) => { record[k] = v; });
        submitRoleScore(record);
    };

    const isLastRole = battleRoleIndex === BATTLE_ROLES.length - 1;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <motion.div
                key={battleRoleIndex}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '32px 32px 20px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}12, transparent)`,
                }}
            >
                {/* Progress dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
                    {BATTLE_ROLES.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: i === battleRoleIndex ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: i < battleRoleIndex ? '#34d399' : i === battleRoleIndex ? color : 'rgba(255,255,255,0.15)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                <div style={{ fontSize: '48px', marginBottom: '8px' }}>{icon}</div>

                <motion.h1
                    initial={{ letterSpacing: '0.3em', opacity: 0 }}
                    animate={{ letterSpacing: '0.1em', opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="font-cinzel font-black"
                    style={{
                        fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                        background: `linear-gradient(135deg, ${color}, white, ${color})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '6px',
                        textShadow: 'none',
                        filter: `drop-shadow(0 0 20px ${color}80)`,
                    }}
                >
                    {label}
                </motion.h1>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                    {description}
                </p>

                <div style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '3px 14px',
                    borderRadius: '20px',
                    background: `${color}20`,
                    border: `1px solid ${color}40`,
                    fontSize: '11px',
                    fontFamily: 'Cinzel',
                    color,
                }}>
                    Round {battleRoleIndex + 1} of {BATTLE_ROLES.length}&nbsp;&nbsp;·&nbsp;&nbsp;🏆 Winner earns {players.length + winnerBonus} pts
                </div>
            </motion.div>

            {/* Scoreboard */}
            <div style={{ padding: '20px 28px 0' }}>
                <Scoreboard players={players} currentPoints={revealed ? currentPoints : null} />
            </div>

            {/* Character cards */}
            <div style={{
                flex: 1,
                padding: '0 28px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: 'center',
                alignItems: 'flex-start',
            }}>
                {players.map((player, i) => {
                    const entry = entries.find(e => e.player.id === player.id)!;
                    const rank = revealed ? getRankOf(player.id) : 0;
                    const pts = revealed && currentPoints ? (currentPoints.get(player.id) ?? 0) : 0;

                    return (
                        <CharacterCard
                            key={player.id}
                            player={player}
                            roleKey={roleKey}
                            statKey={statKey}
                            statValue={entry.statValue}
                            roleColor={color}
                            rank={rank}
                            points={pts}
                            N={players.length}
                            inverted={inverted}
                            revealed={revealed}
                            index={i}
                        />
                    );
                })}
            </div>

            {/* Footer actions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                    padding: '16px 32px 28px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                }}
            >
                {!revealed ? (
                    <button
                        className="btn btn-primary text-base px-10 py-4"
                        onClick={handleReveal}
                        style={{ fontSize: '16px' }}
                    >
                        ⚡ Reveal Stats
                    </button>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="btn btn-primary text-base px-10 py-4"
                        onClick={handleNext}
                        disabled={scored}
                        style={{ fontSize: '16px' }}
                    >
                        {isLastRole ? '🏆 Reveal Winner' : `Next: ${BATTLE_ROLES[battleRoleIndex + 1]?.label} →`}
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
}
