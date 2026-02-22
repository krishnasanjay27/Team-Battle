'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import RoleComparison from '@/components/RoleComparison';

export default function BattlePage() {
    const router = useRouter();
    const { phase, battleComplete } = useGameStore();

    useEffect(() => {
        if (phase === 'setup') router.replace('/');
        if (phase === 'playing' || phase === 'round_summary') router.replace('/game');
        if (phase === 'summary') router.replace('/summary');
    }, [phase, router]);

    useEffect(() => {
        if (battleComplete) {
            router.replace('/summary');
        }
    }, [battleComplete, router]);

    if (phase !== 'battle') return null;

    return <RoleComparison />;
}
