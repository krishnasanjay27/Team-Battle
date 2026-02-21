'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import RoundSummary from '@/components/RoundSummary';

export default function GamePage() {
    const router = useRouter();
    const { phase, players, currentRound, continueAfterRoundSummary } = useGameStore();

    useEffect(() => {
        if (phase === 'setup') router.replace('/');
        if (phase === 'summary') router.replace('/summary');
    }, [phase, router]);

    if (phase === 'playing') return <GameBoard />;

    if (phase === 'round_summary') {
        return (
            <RoundSummary
                players={players}
                round={currentRound - 1} // the just-completed round (round already incremented)
                onContinue={continueAfterRoundSummary}
            />
        );
    }

    return null;
}
