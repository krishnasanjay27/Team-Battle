'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '@/lib/types';
import Card from './Card';
import { useGameStore } from '@/store/gameStore';

interface CardGridProps {
    availableCharacters: Character[];
    isActivePlayer: boolean;
    onDraw: () => void;
}

/** Fisher-Yates shuffle returning a NEW array of indices */
function shuffleIndices(count: number): number[] {
    const arr = Array.from({ length: count }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function CardGrid({ availableCharacters, isActivePlayer, onDraw }: CardGridProps) {
    const drawnCharacter = useGameStore((s) => s.drawnCharacter);
    const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);

    const displayCount = Math.min(availableCharacters.length, 20);

    // Shuffled display order — re-shuffle every time the pool shrinks or the turn changes
    const [order, setOrder] = useState<number[]>(() => shuffleIndices(displayCount));

    useEffect(() => {
        setOrder(shuffleIndices(displayCount));
    }, [displayCount, currentPlayerIndex]);

    // Stable card IDs so AnimatePresence can track individual cards across shuffles
    // We use a generation counter to force re-mount of Cards when turn changes
    const turnKey = `t${currentPlayerIndex}`;

    return (
        <div className="flex flex-col items-center gap-4">
            {!isActivePlayer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '8px 18px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        fontFamily: 'Cinzel, serif',
                    }}
                >
                    Waiting for active player…
                </motion.div>
            )}

            {isActivePlayer && drawnCharacter === null && (
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        padding: '8px 18px',
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.3)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: 'var(--accent-orange)',
                        fontFamily: 'Cinzel, serif',
                    }}
                >
                    ✨ Click a card to draw your character
                </motion.div>
            )}

            <motion.div
                layout
                className="flex flex-wrap justify-center gap-3"
                style={{ maxWidth: '540px' }}
            >
                <AnimatePresence mode="popLayout">
                    {order.map((slot, displayIdx) => (
                        <motion.div
                            key={`${turnKey}-card-${slot}`}
                            layout
                            initial={{ opacity: 0, scale: 0.7, rotate: (Math.random() * 10 - 5) }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.4, rotate: 15, transition: { duration: 0.25 } }}
                            transition={{
                                delay: displayIdx * 0.025,
                                type: 'spring',
                                stiffness: 280,
                                damping: 22,
                            }}
                        >
                            <Card
                                isActive={isActivePlayer}
                                isDisabled={!isActivePlayer || drawnCharacter !== null}
                                isSelected={false}
                                onClick={onDraw}
                                index={displayIdx}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {availableCharacters.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    No characters remaining
                </div>
            )}

            {availableCharacters.length > 20 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Cinzel, serif' }}>
                    +{availableCharacters.length - 20} more in the deck
                </div>
            )}
        </div>
    );
}
