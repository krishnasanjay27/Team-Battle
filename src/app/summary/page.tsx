'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import FinalSummary from '@/components/FinalSummary';

export default function SummaryPage() {
    const router = useRouter();
    const { phase, players, resetGame, startBattle, battleComplete } = useGameStore();

    useEffect(() => {
        if (phase === 'setup') router.replace('/');
        if (phase === 'playing' || phase === 'round_summary') router.replace('/game');
        if (phase === 'battle') router.replace('/battle');
    }, [phase, router]);

    // When startBattle is called, navigate to /battle
    const handleStartBattle = () => {
        startBattle();
        router.push('/battle');
    };

    const handlePlayAgain = () => {
        resetGame();
        router.push('/');
    };

    if (phase !== 'summary') return null;

    return (
        <FinalSummary
            players={players}
            onStartBattle={handleStartBattle}
            onPlayAgain={handlePlayAgain}
        />
    );
}
