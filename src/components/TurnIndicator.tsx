'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/types';

interface TurnIndicatorProps {
    currentPlayer: Player;
    round: number;
    remainingChars: number;
    totalPlayers: number;
    currentPlayerIndex: number;
}

export default function TurnIndicator({
    currentPlayer,
    round,
    remainingChars,
    totalPlayers,
    currentPlayerIndex,
}: TurnIndicatorProps) {
    const initials = currentPlayer.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className="glass p-4 rounded-2xl"
            style={{ border: '1px solid rgba(249,115,22,0.25)' }}
        >
            {/* Current Player */}
            <div className="flex items-center gap-3 mb-4">
                <motion.div
                    animate={{ boxShadow: ['0 0 10px rgba(249,115,22,0.3)', '0 0 25px rgba(249,115,22,0.6)', '0 0 10px rgba(249,115,22,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f97316, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Cinzel, serif',
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'white',
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </motion.div>
                <div>
                    <div className="text-xs font-cinzel" style={{ color: 'var(--text-muted)' }}>
                        CURRENT TURN
                    </div>
                    <div className="font-cinzel font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {currentPlayer.name}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2">
                <Stat label="Round" value={round} icon="🔄" />
                <Stat label="Cards Left" value={remainingChars} icon="🃏" color={remainingChars <= 5 ? '#f87171' : undefined} />
            </div>

            {/* Player order mini dots */}
            <div className="mt-4">
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                    Turn Order
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: totalPlayers }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={i === currentPlayerIndex ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{
                                width: i === currentPlayerIndex ? 10 : 7,
                                height: i === currentPlayerIndex ? 10 : 7,
                                borderRadius: '50%',
                                background:
                                    i === currentPlayerIndex
                                        ? 'linear-gradient(135deg, #f97316, #dc2626)'
                                        : 'rgba(255,255,255,0.15)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function Stat({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: string;
    color?: string;
}) {
    return (
        <div
            style={{
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {icon} {label}
            </div>
            <div
                className="font-cinzel font-bold text-lg"
                style={{ color: color || 'var(--accent-orange)' }}
            >
                {value}
            </div>
        </div>
    );
}
