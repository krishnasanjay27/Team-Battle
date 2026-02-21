'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/lib/types';
import { playSkip } from '@/lib/sounds';

interface SkipButtonProps {
    currentPlayer: Player;
    canSkip: boolean; // false if no drawn card
    onSkip: () => void;
}

export default function SkipButton({ currentPlayer, canSkip, onSkip }: SkipButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const isUsed = currentPlayer.skipUsed;

    const handleSkipClick = () => {
        if (isUsed || !canSkip) return;
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        setShowConfirm(false);
        playSkip();
        onSkip();
    };

    return (
        <div className="relative">
            <button
                className="btn btn-danger w-full"
                onClick={handleSkipClick}
                disabled={isUsed || !canSkip}
                style={{ fontSize: '13px' }}
            >
                {isUsed ? (
                    <>
                        <span>🚫</span>
                        <span>Skip Used</span>
                    </>
                ) : (
                    <>
                        <span>⏭️</span>
                        <span>Skip {!canSkip ? '(Draw First)' : '(1 Remaining)'}</span>
                    </>
                )}
            </button>

            {/* Confirmation overlay */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        style={{
                            position: 'absolute',
                            bottom: '110%',
                            left: 0,
                            right: 0,
                            background: '#1a1a2e',
                            border: '1px solid rgba(220,38,38,0.5)',
                            borderRadius: '12px',
                            padding: '14px',
                            zIndex: 50,
                        }}
                    >
                        <p
                            className="font-cinzel text-sm font-semibold mb-1"
                            style={{ color: '#f87171' }}
                        >
                            Use Your Only Skip?
                        </p>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                            The character will be discarded. You cannot skip again this game.
                        </p>
                        <div className="flex gap-2">
                            <button
                                className="btn btn-danger flex-1 py-2"
                                style={{ fontSize: '12px' }}
                                onClick={handleConfirm}
                            >
                                Confirm Skip
                            </button>
                            <button
                                className="btn btn-secondary flex-1 py-2"
                                style={{ fontSize: '12px' }}
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
