'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import RoundSummary from '@/components/RoundSummary';

export default function SummaryPage() {
    const router = useRouter();
    const { phase, players, currentRound, resetGame } = useGameStore();

    useEffect(() => {
        if (phase === 'setup') router.replace('/');
        if (phase === 'playing' || phase === 'round_summary') router.replace('/game');
    }, [phase, router]);

    if (phase !== 'summary') return null;

    const handlePlayAgain = () => {
        resetGame();
        router.push('/');
    };

    return (
        <div>
            <RoundSummary
                players={players}
                round={currentRound}
                onContinue={handlePlayAgain}
                isFinalSummary
            />
            {/* Play Again button */}
            <div
                style={{
                    padding: '20px 32px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <button className="btn btn-primary text-base px-10 py-4" onClick={handlePlayAgain}>
                    🔄 Play Again
                </button>
            </div>
        </div>
    );
}
