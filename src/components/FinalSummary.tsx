'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, useMemo } from 'react';
import CharacterAvatar from './CharacterAvatar';
import { Player } from '@/lib/types';
import { ROLE_DEFINITIONS, countFilledRoles, TOTAL_ROLES } from '@/lib/roles';
import { useGameStore } from '@/store/gameStore';
import { playVictory, playRoundSummary } from '@/lib/sounds';

const ROLE_COLORS: Record<string, string> = {
    captain: '#fbbf24',
    vice_captain: '#a78bfa',
    tank: '#60a5fa',
    healer: '#34d399',
    assassin: '#f87171',
    support_1: '#38bdf8',
    support_2: '#22d3ee',
    traitor: '#fb923c',
};

// ── Confetti ──────────────────────────────────────────────────────────────────
interface ParticleData {
    color: string; x: number; delay: number; duration: number;
    size: number; isCircle: boolean; rotDir: number; xDrift: number;
}

function Confetti() {
    const PALETTE = ['#fbbf24', '#f97316', '#34d399', '#60a5fa', '#a78bfa', '#f87171', '#38bdf8'];
    // Pre-compute so hydration is deterministic — seeded by index
    const particles: ParticleData[] = useMemo(() => Array.from({ length: 60 }, (_, i) => {
        const r = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
        return {
            color: PALETTE[i % PALETTE.length],
            x: r(i * 7 + 1) * 100,
            delay: r(i * 3 + 2) * 1.5,
            duration: 2.5 + r(i * 5 + 3) * 2,
            size: 6 + r(i * 11 + 4) * 8,
            isCircle: r(i * 13 + 5) > 0.5,
            rotDir: r(i * 17 + 6) > 0.5 ? 1 : -1,
            xDrift: (r(i * 19 + 7) - 0.5) * 200,
        };
    }), []);

    return (
        <>
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'fixed', left: `${p.x}%`, top: '-20px',
                        width: p.size, height: p.size,
                        borderRadius: p.isCircle ? '50%' : '2px',
                        background: p.color, zIndex: 100, pointerEvents: 'none',
                    }}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{ y: 1200, opacity: [1, 1, 0], rotate: 360 * p.rotDir, x: [0, p.xDrift] }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
                />
            ))}
        </>
    );
}

// ── Team Card ─────────────────────────────────────────────────────────────────
function TeamCard({ player, index }: { player: Player; index: number }) {
    const filled = countFilledRoles(player.team);
    const initials = player.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass"
            style={{
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                minWidth: '220px',
                flex: '1 1 220px',
            }}
        >
            <div style={{
                padding: '14px 16px',
                background: 'rgba(249,115,22,0.08)',
                borderBottom: '1px solid rgba(249,115,22,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #dc2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Cinzel, serif', fontWeight: '700', fontSize: '13px',
                    color: 'white', flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <div className="font-cinzel font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {player.name}&apos;s Team
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {filled}/{TOTAL_ROLES} roles filled
                    </div>
                </div>
                <div style={{
                    fontSize: '11px', fontFamily: 'Cinzel, serif',
                    color: filled === TOTAL_ROLES ? '#34d399' : 'var(--accent-orange)',
                }}>
                    {filled === TOTAL_ROLES ? '✅ Complete' : `${TOTAL_ROLES - filled} left`}
                </div>
            </div>

            <div style={{ padding: '12px 14px' }}>
                {ROLE_DEFINITIONS.map((slot) => {
                    const char = player.team[slot.key];
                    const color = ROLE_COLORS[slot.key] || '#f97316';
                    return (
                        <div key={slot.key} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '8px',
                                background: char ? `${color}20` : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${char ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', flexShrink: 0,
                            }}>
                                {slot.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="font-cinzel font-semibold" style={{ fontSize: '11px', color: char ? color : 'var(--text-muted)' }}>
                                    {slot.label}
                                </div>
                            </div>
                            {char ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <CharacterAvatar character={char} size={32} borderRadius="6px"
                                        borderStyle={`1px solid ${color}50`} objectPosition="top" fontSize={11} />
                                    <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', fontWeight: '500', maxWidth: '90px', lineHeight: '1.3' }}>
                                        {char.name}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    Empty
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ── Final Scoreboard (post-battle) ────────────────────────────────────────────
function FinalScoreboard({ players, winnerIds }: { players: Player[]; winnerIds: Set<number> }) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div style={{
            display: 'flex', gap: '16px', justifyContent: 'center',
            flexWrap: 'wrap', padding: '0 28px',
        }}>
            {sorted.map((p, rank) => {
                const isWinner = winnerIds.has(p.id);
                // Rank label: tied top scorers all get 🥇
                const displayRank = isWinner ? 0 : rank;
                return (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 40, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: isWinner ? 1.1 : 1 }}
                        transition={{ delay: rank * 0.15 + 0.3, type: 'spring' }}
                        style={{
                            flex: '1 1 160px',
                            maxWidth: '220px',
                            background: isWinner
                                ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.15))'
                                : 'rgba(255,255,255,0.04)',
                            border: isWinner ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '24px 16px',
                            textAlign: 'center',
                            boxShadow: isWinner ? '0 0 40px rgba(251,191,36,0.3)' : 'none',
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {medals[displayRank] ?? `#${displayRank + 1}`}
                        </div>
                        <div className="font-cinzel font-bold" style={{
                            fontSize: '15px',
                            color: isWinner ? '#fbbf24' : 'var(--text-primary)',
                            marginBottom: '4px',
                        }}>
                            {p.name}
                        </div>
                        <div className="font-cinzel font-black" style={{
                            fontSize: '36px',
                            color: isWinner ? '#fbbf24' : 'var(--text-secondary)',
                            lineHeight: 1,
                        }}>
                            {p.score}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Inter', marginTop: '4px' }}>
                            points
                        </div>
                        {isWinner && (
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{
                                    marginTop: '10px', fontSize: '11px',
                                    fontFamily: 'Cinzel', color: '#fbbf24',
                                    fontWeight: '700', letterSpacing: '0.1em',
                                }}
                            >
                                {winnerIds.size > 1 ? '✦ CO-CHAMPION ✦' : '✦ CHAMPION ✦'}
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface FinalSummaryProps {
    players: Player[];
    onStartBattle: () => void;
    onPlayAgain: () => void;
}

export default function FinalSummary({ players, onStartBattle, onPlayAgain }: FinalSummaryProps) {
    const battleComplete = useGameStore((s) => s.battleComplete);
    const [showConfetti, setShowConfetti] = useState(false);
    const soundPlayed = useRef(false);

    // Determine winner(s) — handles draw condition
    const maxScore = Math.max(...players.map((p) => p.score));
    const winners = players.filter((p) => p.score === maxScore);
    const winnerIds = new Set(winners.map((p) => p.id));
    const isDraw = winners.length > 1;

    useEffect(() => {
        if (battleComplete && !soundPlayed.current) {
            soundPlayed.current = true;
            const t = setTimeout(() => {
                playVictory();
                setShowConfetti(true);
            }, 600);
            return () => clearTimeout(t);
        } else if (!battleComplete) {
            const t = setTimeout(() => playRoundSummary(), 400);
            return () => clearTimeout(t);
        }
    }, [battleComplete]);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Confetti overlay */}
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '28px 32px 20px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: battleComplete
                        ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,0.12), transparent)'
                        : undefined,
                }}
            >
                <div className="text-4xl mb-2">
                    {battleComplete ? '🏆' : '📋'}
                </div>
                <h1 className="font-cinzel font-black text-3xl mb-1" style={{
                    background: battleComplete
                        ? 'linear-gradient(135deg, #fbbf24, #f97316, #fbbf24)'
                        : 'linear-gradient(135deg, #f97316, #fbbf24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {battleComplete ? 'Final Results' : 'Final Summary'}
                </h1>
                <p className="font-cinzel text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {battleComplete
                        ? isDraw
                            ? `It's a draw! ${winners.map(w => w.name).join(' & ')} are tied at ${maxScore} points!`
                            : `${winners[0].name} dominates the battlefield with ${maxScore} points!`
                        : 'The draft is complete. Review your teams before the battle begins.'}
                </p>
            </motion.div>

            {/* Winner reveal (post-battle) */}
            {battleComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                    style={{ padding: '28px 0 20px', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                            display: 'inline-block',
                            background: isDraw
                                ? 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.2))'
                                : 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.2))',
                            border: isDraw ? '2px solid #a78bfa' : '2px solid #fbbf24',
                            borderRadius: '24px',
                            padding: '16px 40px',
                            marginBottom: '24px',
                            boxShadow: isDraw
                                ? '0 0 60px rgba(167,139,250,0.4)'
                                : '0 0 60px rgba(251,191,36,0.4)',
                        }}
                    >
                        <div style={{
                            fontSize: '14px', fontFamily: 'Cinzel',
                            color: isDraw ? '#a78bfa' : '#fbbf24',
                            letterSpacing: '0.2em', marginBottom: '6px'
                        }}>
                            {isDraw ? '⚖️ IT\'S A DRAW!' : '✦ WINNER ✦'}
                        </div>
                        <div className="font-cinzel font-black" style={{
                            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                            background: isDraw
                                ? 'linear-gradient(135deg, #60a5fa, white, #a78bfa)'
                                : 'linear-gradient(135deg, #fbbf24, white, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: isDraw
                                ? 'drop-shadow(0 0 20px rgba(167,139,250,0.6))'
                                : 'drop-shadow(0 0 20px rgba(251,191,36,0.6))',
                        }}>
                            {winners.map(w => w.name).join(' & ')}
                        </div>
                    </motion.div>

                    <FinalScoreboard players={players} winnerIds={winnerIds} />
                </motion.div>
            )}

            {/* Teams grid */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '24px 28px',
                display: 'flex', flexWrap: 'wrap', gap: '16px',
                justifyContent: 'center', alignContent: 'flex-start',
            }}>
                {!battleComplete && players.map((player, i) => (
                    <TeamCard key={player.id} player={player} index={i} />
                ))}
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    padding: '20px 32px 28px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                }}
            >
                {battleComplete ? (
                    <button className="btn btn-secondary text-base px-8 py-3" onClick={onPlayAgain}>
                        🔄 Play Again
                    </button>
                ) : (
                    <button className="btn btn-primary text-base px-10 py-4" onClick={onStartBattle}
                        style={{ fontSize: '16px' }}>
                        ⚔️ Begin Battle
                    </button>
                )}
            </motion.div>
        </div>
    );
}
