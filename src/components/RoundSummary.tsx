'use client';

import { motion } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import { Player } from '@/lib/types';
import { ROLE_DEFINITIONS, countFilledRoles, TOTAL_ROLES } from '@/lib/roles';
import { useGameStore } from '@/store/gameStore';
import { playRoundSummary, playVictory } from '@/lib/sounds';
import { useEffect } from 'react';

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

interface RoundSummaryProps {
    players: Player[];
    round: number; // the just-completed round number
    onContinue: () => void;
    isFinalSummary?: boolean;
}

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
            {/* Team header */}
            <div
                style={{
                    padding: '14px 16px',
                    background: 'rgba(249,115,22,0.08)',
                    borderBottom: '1px solid rgba(249,115,22,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f97316, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Cinzel, serif',
                        fontWeight: '700',
                        fontSize: '13px',
                        color: 'white',
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <div className="font-cinzel font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {player.name}'s Team
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {filled}/{TOTAL_ROLES} roles filled
                    </div>
                </div>
                {/* Progress arc */}
                <div
                    style={{
                        fontSize: '11px',
                        fontFamily: 'Cinzel, serif',
                        color: filled === TOTAL_ROLES ? '#34d399' : 'var(--accent-orange)',
                    }}
                >
                    {filled === TOTAL_ROLES ? '✅ Complete' : `${TOTAL_ROLES - filled} left`}
                </div>
            </div>

            {/* Role rows */}
            <div style={{ padding: '12px 14px' }}>
                {ROLE_DEFINITIONS.map((slot) => {
                    const char = player.team[slot.key];
                    const color = ROLE_COLORS[slot.key] || '#f97316';

                    return (
                        <div
                            key={slot.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '7px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            {/* Role badge */}
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '8px',
                                    background: char ? `${color}20` : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${char ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    flexShrink: 0,
                                }}
                            >
                                {slot.icon}
                            </div>

                            {/* Role name */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    className="font-cinzel font-semibold"
                                    style={{ fontSize: '11px', color: char ? color : 'var(--text-muted)' }}
                                >
                                    {slot.label}
                                </div>
                            </div>

                            {/* Character or placeholder */}
                            {char ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <CharacterAvatar
                                        character={char}
                                        size={32}
                                        borderRadius="6px"
                                        borderStyle={`1px solid ${color}50`}
                                        objectPosition="top"
                                        fontSize={11}
                                    />
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            fontFamily: 'Inter, sans-serif',
                                            color: 'var(--text-primary)',
                                            fontWeight: '500',
                                            maxWidth: '90px',
                                            lineHeight: '1.3',
                                        }}
                                    >
                                        {char.name}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        fontSize: '10px',
                                        fontFamily: 'Inter, sans-serif',
                                        color: 'var(--text-muted)',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    No character assigned yet
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default function RoundSummary({ players, round, onContinue, isFinalSummary = false }: RoundSummaryProps) {
    const availableCharacters = useGameStore((s) => s.availableCharacters);
    const noCharsLeft = availableCharacters.length === 0;

    // Play fanfare sound when summary mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isFinalSummary) {
                playVictory();
            } else {
                playRoundSummary();
            }
        }, 400);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '28px 32px 20px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <div className="text-4xl mb-2">{isFinalSummary ? '🏆' : '📋'}</div>
                <h1
                    className="font-cinzel font-black text-3xl mb-1"
                    style={{
                        background: isFinalSummary
                            ? 'linear-gradient(135deg, #fbbf24, #f97316)'
                            : 'linear-gradient(135deg, #f97316, #fbbf24)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {isFinalSummary ? 'Final Results' : `Round ${round} Summary`}
                </h1>
                <p className="font-cinzel text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {isFinalSummary
                        ? 'The battle is over. Here are the final teams.'
                        : `Round ${round} complete — here's how all teams look so far.`}
                </p>
            </motion.div>

            {/* Teams grid */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 28px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    justifyContent: 'center',
                    alignContent: 'flex-start',
                }}
            >
                {players.map((player, i) => (
                    <TeamCard key={player.id} player={player} index={i} />
                ))}
            </div>

            {/* Footer */}
            {!isFinalSummary && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        padding: '20px 32px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                    }}
                >
                    {noCharsLeft ? (
                        <button className="btn btn-primary text-base px-10 py-4" onClick={onContinue}>
                            🏆 See Final Results
                        </button>
                    ) : (
                        <button className="btn btn-primary text-base px-10 py-4" onClick={onContinue}>
                            ▶️ Start Round {round + 1}
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
