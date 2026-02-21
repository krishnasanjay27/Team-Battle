'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Character } from '@/lib/types';

type SetupStep = 'anime' | 'players';

const ANIME_OPTIONS: {
    id: AnimeChoice;
    name: string;
    subtitle: string;
    tagline: string;
    color: string;
    glow: string;
    gradient: string;
    bgPattern: string;
    logo: string;
    folder: string;   // actual public folder name (may have spaces)
}[] = [
        {
            id: 'naruto',
            name: 'NARUTO',
            subtitle: 'Hidden Leaf Village',
            tagline: 'Believe it! 🦊',
            color: '#f97316',
            glow: 'rgba(249,115,22,0.55)',
            gradient: 'linear-gradient(135deg, #f97316, #dc2626)',
            bgPattern: 'radial-gradient(ellipse at top left, rgba(249,115,22,0.12) 0%, transparent 70%)',
            logo: '/naruto-logo.jpg',
            folder: 'naruto',
        },
        {
            id: 'bleach',
            name: 'BLEACH',
            subtitle: 'Soul Society',
            tagline: 'Bankai! ⚔️',
            color: '#60a5fa',
            glow: 'rgba(96,165,250,0.55)',
            gradient: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
            bgPattern: 'radial-gradient(ellipse at bottom right, rgba(96,165,250,0.12) 0%, transparent 70%)',
            logo: '/bleach-logo.jpg',
            folder: 'bleach',
        },
        {
            id: 'demon slayer',
            name: 'DEMON SLAYER',
            subtitle: 'Demon Slayer Corps',
            tagline: 'Total Concentration! 🔥',
            color: '#f43f5e',
            glow: 'rgba(244,63,94,0.55)',
            gradient: 'linear-gradient(135deg, #be123c, #f43f5e)',
            bgPattern: 'radial-gradient(ellipse at top right, rgba(244,63,94,0.12) 0%, transparent 70%)',
            logo: '/DemonSlayer-logo.jpg',
            folder: 'demon slayer',
        },
        {
            id: 'Jujutsu Kaisen',
            name: 'JUJUTSU KAISEN',
            subtitle: 'Tokyo Jujutsu High',
            tagline: 'Cursed Technique! ⚪',
            color: '#a855f7',
            glow: 'rgba(168,85,247,0.55)',
            gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            bgPattern: 'radial-gradient(ellipse at bottom left, rgba(168,85,247,0.12) 0%, transparent 70%)',
            logo: '/JUJUTSU KAISEN-logo.jpg',
            folder: 'Jujutsu Kaisen',
        },
    ];

type AnimeChoice = string;

export default function SetupScreen() {
    const router = useRouter();
    const setupGame = useGameStore((s) => s.setupGame);

    const [step, setStep] = useState<SetupStep>('anime');
    const [selectedAnime, setSelectedAnime] = useState<AnimeChoice | null>(null);
    const [playerCount, setPlayerCount] = useState(2);
    const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadCharacters = async (animeId: AnimeChoice) => {
        setLoading(true);
        setError('');
        try {
            const option = ANIME_OPTIONS.find((a) => a.id === animeId)!;
            const url = `/${encodeURIComponent(option.folder)}/characters.json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: Character[] = await res.json();
            setCharacters(data);
        } catch {
            setError(
                `Could not load ${animeId} characters. Run:\n  py extract_dataset.py --anime ${animeId} --parquet <file>.parquet`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAnimeSelect = async (anime: AnimeChoice) => {
        setSelectedAnime(anime);
        await loadCharacters(anime);
        setStep('players');
    };

    const handleCountChange = (count: number) => {
        setPlayerCount(count);
        setPlayerNames((prev) => {
            const next = [...prev];
            while (next.length < count) next.push('');
            return next.slice(0, count);
        });
    };

    const handleStart = () => {
        if (characters.length === 0) return;
        setupGame(playerNames, characters);
        router.push('/game');
    };

    const anime = selectedAnime ? ANIME_OPTIONS.find((a) => a.id === selectedAnime) : null;
    const allRolesCanBeFilled = characters.length >= 8;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated background orb for selected anime */}
            {anime && (
                <motion.div
                    key={anime.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: anime.bgPattern,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 relative z-10"
            >
                <div className="text-5xl mb-3">⚔️</div>
                <h1
                    className="font-cinzel text-5xl font-black mb-1"
                    style={{
                        background: anime
                            ? anime.gradient
                            : 'linear-gradient(135deg, #f97316, #fbbf24, #dc2626)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        transition: 'all 0.4s ease',
                    }}
                >
                    TEAM BATTLE
                </h1>
                <p className="font-cinzel text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {step === 'anime' ? 'Choose your anime universe' : `${anime?.name} · Character Role Assignment`}
                </p>
            </motion.div>

            {/* ── STEP 1: Anime Selection ─────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {step === 'anime' && (
                    <motion.div
                        key="anime-step"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: -40 }}
                        transition={{ duration: 0.35 }}
                        className="relative z-10 w-full max-w-xl"
                    >
                        <div className="grid grid-cols-2 gap-5">
                            {ANIME_OPTIONS.map((a, i) => (
                                <motion.button
                                    key={a.id}
                                    initial={{ opacity: 0, y: 32 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.14, type: 'spring', stiffness: 260, damping: 22 }}
                                    whileHover={{ scale: 1.035, y: -6 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleAnimeSelect(a.id)}
                                    style={{
                                        position: 'relative',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        height: '320px',
                                        cursor: 'pointer',
                                        border: `2px solid ${a.color}35`,
                                        boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                                        transition: 'border-color 0.25s, box-shadow 0.25s',
                                        padding: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.borderColor = `${a.color}90`;
                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 48px ${a.glow}, 0 0 0 1px ${a.color}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.borderColor = `${a.color}35`;
                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.5)`;
                                    }}
                                >
                                    {/* Full-bleed logo image OR gradient background */}
                                    {a.logo ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={a.logo}
                                                alt={a.name}
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                }}
                                            />
                                        </>
                                    ) : (
                                        /* Gradient background with big name for animes without a logo yet */
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: a.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '16px',
                                        }}>
                                            <span style={{
                                                fontFamily: 'Cinzel, serif',
                                                fontWeight: '900',
                                                fontSize: '22px',
                                                color: 'rgba(255,255,255,0.92)',
                                                textAlign: 'center',
                                                lineHeight: '1.3',
                                                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                                                letterSpacing: '0.06em',
                                            }}>
                                                {a.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Subtle vignette to keep logo visible but add depth */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)`,
                                    }} />

                                    {/* Bottom gradient bar with text */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '20px 16px 16px',
                                        background: `linear-gradient(transparent, rgba(0,0,0,0.88) 60%)`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}>
                                        <p className="font-cinzel text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                            {a.subtitle}
                                        </p>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '4px 16px',
                                                borderRadius: '20px',
                                                background: `${a.color}20`,
                                                border: `1px solid ${a.color}60`,
                                                fontSize: '12px',
                                                fontFamily: 'Inter, sans-serif',
                                                color: a.color,
                                                backdropFilter: 'blur(6px)',
                                            }}
                                        >
                                            {a.tagline}
                                        </span>
                                    </div>

                                    {/* Top-left: anime name badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        padding: '3px 10px',
                                        borderRadius: '8px',
                                        background: 'rgba(0,0,0,0.55)',
                                        border: `1px solid ${a.color}40`,
                                        backdropFilter: 'blur(6px)',
                                        fontSize: '10px',
                                        fontFamily: 'Cinzel, serif',
                                        fontWeight: '700',
                                        color: a.color,
                                        letterSpacing: '0.08em',
                                    }}>
                                        {a.name}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 2: Player Setup ─────────────────────────────────────── */}
                {step === 'players' && (
                    <motion.div
                        key="players-step"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.35 }}
                        className="relative z-10 glass w-full max-w-md p-8"
                        style={{ border: `1px solid ${anime?.color}30` }}
                    >
                        {loading ? (
                            <div className="text-center py-10">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    style={{ fontSize: '36px', display: 'inline-block' }}
                                >
                                    ⚔️
                                </motion.div>
                                <p className="mt-3 font-cinzel text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Loading {anime?.name} characters…
                                </p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-6">
                                <div className="text-4xl mb-3">⚠️</div>
                                <p className="text-red-400 text-sm whitespace-pre-line mb-4">{error}</p>
                                <button
                                    className="btn btn-secondary text-xs"
                                    onClick={() => { setStep('anime'); setError(''); }}
                                >
                                    ← Back
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Anime badge + back */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={anime?.logo} alt={anime?.name} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: '4px' }} />
                                        <span
                                            className="font-cinzel font-bold text-base"
                                            style={{
                                                background: anime?.gradient,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            {anime?.name}
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '11px' }}
                                        onClick={() => { setStep('anime'); setCharacters([]); }}
                                    >
                                        ← Change
                                    </button>
                                </div>

                                {/* Characters available */}
                                <div
                                    className="flex items-center justify-between mb-5 p-3 rounded-xl"
                                    style={{
                                        background: `${anime?.color}0d`,
                                        border: `1px solid ${anime?.color}25`,
                                    }}
                                >
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Characters Available
                                    </span>
                                    <span
                                        className="font-cinzel font-bold"
                                        style={{ color: anime?.color }}
                                    >
                                        {characters.length}
                                    </span>
                                </div>

                                {!allRolesCanBeFilled && (
                                    <p className="text-red-400 text-xs mb-4 text-center">
                                        ⚠️ Need at least 8 characters to fill all roles.
                                    </p>
                                )}

                                {/* Player count */}
                                <div className="mb-5">
                                    <label className="font-cinzel text-sm font-semibold mb-3 block" style={{ color: '#fbbf24' }}>
                                        Number of Players: {playerCount}
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                                            <button
                                                key={n}
                                                onClick={() => handleCountChange(n)}
                                                className="btn w-10 h-10 p-0 text-sm"
                                                style={{
                                                    background: playerCount === n ? anime?.gradient : 'rgba(255,255,255,0.06)',
                                                    border: playerCount === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                    color: playerCount === n ? 'white' : 'var(--text-secondary)',
                                                    fontFamily: 'Inter, sans-serif',
                                                }}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Player names */}
                                <div className="mb-7 space-y-3">
                                    <label className="font-cinzel text-sm font-semibold block" style={{ color: '#fbbf24' }}>
                                        Player Names
                                    </label>
                                    <AnimatePresence>
                                        {playerNames.map((name, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -16 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 16 }}
                                                transition={{ delay: i * 0.04 }}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder={`Player ${i + 1}`}
                                                    value={name}
                                                    onChange={(e) => {
                                                        const next = [...playerNames];
                                                        next[i] = e.target.value;
                                                        setPlayerNames(next);
                                                    }}
                                                    maxLength={20}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '10px',
                                                        color: 'var(--text-primary)',
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s',
                                                    }}
                                                    onFocus={(e) =>
                                                        (e.target.style.borderColor = anime?.color || 'var(--accent-orange)')
                                                    }
                                                    onBlur={(e) =>
                                                        (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
                                                    }
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Start button */}
                                <button
                                    className="btn w-full text-base py-4 font-cinzel"
                                    onClick={handleStart}
                                    disabled={!allRolesCanBeFilled}
                                    style={{
                                        background: allRolesCanBeFilled ? anime?.gradient : 'rgba(255,255,255,0.06)',
                                        color: 'white',
                                        border: 'none',
                                        boxShadow: allRolesCanBeFilled ? `0 4px 20px ${anime?.glow}` : 'none',
                                        cursor: allRolesCanBeFilled ? 'pointer' : 'not-allowed',
                                        opacity: allRolesCanBeFilled ? 1 : 0.4,
                                    }}
                                >
                                    ⚔️ Begin Battle
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer roles hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center relative z-10"
                style={{ color: 'var(--text-muted)', fontSize: '12px' }}
            >
                <p className="font-cinzel mb-1">8 Roles · 1 Skip Per Player</p>
                <p>Captain · Vice-Captain · Tank · Healer · Assassin · Support ×2 · Traitor</p>
            </motion.div>
        </div>
    );
}
