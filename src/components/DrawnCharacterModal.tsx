'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character, Player, RoleKey } from '@/lib/types';
import { ROLE_DEFINITIONS } from '@/lib/roles';
import SkipButton from './SkipButton';
import { playRoleAssigned } from '@/lib/sounds';
import CharacterAvatar from './CharacterAvatar';

interface DrawnCharacterModalProps {
    character: Character;
    currentPlayer: Player;
    onAssignRole: (roleKey: RoleKey) => void;
    onSkip: () => void;
}

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

export default function DrawnCharacterModal({
    character,
    currentPlayer,
    onAssignRole,
    onSkip,
}: DrawnCharacterModalProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <AnimatePresence>
            <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.78)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                <motion.div
                    key="modal-content"
                    initial={{ opacity: 0, scale: 0.88, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="glass"
                    style={{
                        width: '100%',
                        maxWidth: '480px',
                        padding: '28px',
                        border: '1px solid rgba(249,115,22,0.4)',
                        boxShadow: '0 0 60px rgba(249,115,22,0.15)',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-5">
                        <p className="font-cinzel text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                            {currentPlayer.name}'s draw
                        </p>
                        <h2
                            className="font-cinzel font-black text-2xl"
                            style={{
                                background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {character.name}
                        </h2>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                            Assign to a role in <strong style={{ color: 'var(--text-secondary)' }}>{currentPlayer.name}'s team</strong>
                        </p>
                    </div>

                    {/* Character portrait */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 20 }}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '22px',
                        }}
                    >
                        <div style={{ boxShadow: '0 0 30px rgba(249,115,22,0.3)', borderRadius: '14px', border: '3px solid rgba(249,115,22,0.6)' }}>
                            <CharacterAvatar
                                character={character}
                                size={150}
                                borderRadius="12px"
                                objectPosition="top"
                                fontSize={42}
                            />
                        </div>
                    </motion.div>

                    {/* Role grid — only show EMPTY slots for this player */}
                    <div className="mb-4">
                        <h3 className="font-cinzel text-xs font-bold mb-3 text-center" style={{ color: 'var(--accent-gold)' }}>
                            Assign to Role
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {ROLE_DEFINITIONS.map((slot) => {
                                const isOccupied = currentPlayer.team[slot.key] !== null;
                                const color = ROLE_COLORS[slot.key] || '#f97316';
                                const isHov = hovered === slot.key;

                                return (
                                    <motion.button
                                        key={slot.key}
                                        whileHover={!isOccupied ? { scale: 1.03 } : {}}
                                        whileTap={!isOccupied ? { scale: 0.97 } : {}}
                                        onMouseEnter={() => !isOccupied && setHovered(slot.key)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => { if (!isOccupied) { playRoleAssigned(); onAssignRole(slot.key); } }}
                                        disabled={isOccupied}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            border: `1px solid ${isOccupied ? 'rgba(255,255,255,0.05)' : `${color}50`}`,
                                            background: isOccupied
                                                ? 'rgba(255,255,255,0.03)'
                                                : isHov
                                                    ? `${color}22`
                                                    : 'rgba(255,255,255,0.06)',
                                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                                            opacity: isOccupied ? 0.4 : 1,
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{slot.icon}</span>
                                            <div>
                                                <div
                                                    className="font-cinzel font-semibold text-xs"
                                                    style={{ color: isOccupied ? 'var(--text-muted)' : color }}
                                                >
                                                    {slot.label}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    {isOccupied
                                                        ? `✓ ${currentPlayer.team[slot.key]?.name}`
                                                        : slot.description}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 0' }} />

                    {/* Skip */}
                    <SkipButton currentPlayer={currentPlayer} canSkip={true} onSkip={onSkip} />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
