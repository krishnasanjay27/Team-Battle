'use client';

import { useGameStore } from '@/store/gameStore';
import TurnIndicator from './TurnIndicator';
import CardGrid from './CardGrid';
import DrawnCharacterModal from './DrawnCharacterModal';
import { RoleKey } from '@/lib/types';
import { ROLE_DEFINITIONS, countFilledRoles, TOTAL_ROLES } from '@/lib/roles';
import CharacterAvatar from './CharacterAvatar';

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

export default function GameBoard() {
    const {
        players,
        currentPlayerIndex,
        currentRound,
        availableCharacters,
        drawnCharacter,
        drawCard,
        assignRole,
        useSkip,
    } = useGameStore();

    const currentPlayer = players[currentPlayerIndex];

    return (
        <div className="min-h-screen flex flex-col" style={{ paddingBottom: '40px' }}>
            {/* Top bar */}
            <div
                className="flex items-center justify-between px-6 py-3 flex-wrap gap-2"
                style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(10,10,15,0.85)',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                <h1
                    className="font-cinzel font-black text-lg"
                    style={{
                        background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    ⚔️ TEAM BATTLE
                </h1>

                {/* Round badge */}
                <div
                    style={{
                        padding: '4px 14px',
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.3)',
                        borderRadius: '20px',
                        fontFamily: 'Cinzel, serif',
                        fontSize: '12px',
                        color: 'var(--accent-orange)',
                    }}
                >
                    Round {currentRound}
                </div>

                {/* Skip status per player */}
                <div className="flex gap-2 flex-wrap">
                    {players.map((p) => (
                        <div
                            key={p.id}
                            title={`${p.name}: ${p.skipUsed ? 'Skip Used' : 'Skip Available'}`}
                            style={{
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontFamily: 'Inter, sans-serif',
                                background: p.skipUsed ? 'rgba(220,38,38,0.1)' : 'rgba(249,115,22,0.1)',
                                border: `1px solid ${p.skipUsed ? 'rgba(220,38,38,0.25)' : 'rgba(249,115,22,0.25)'}`,
                                color: p.skipUsed ? '#fca5a5' : '#fdba74',
                            }}
                        >
                            {p.name.split(' ')[0]} {p.skipUsed ? '🚫' : '⏭️'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main layout: left sidebar | center cards | right teams mini-view */}
            <div className="flex flex-1 gap-4 p-4" style={{ minHeight: 0 }}>

                {/* Left: Turn Indicator */}
                <div style={{ width: '200px', flexShrink: 0 }}>
                    <TurnIndicator
                        currentPlayer={currentPlayer}
                        round={currentRound}
                        remainingChars={availableCharacters.length}
                        totalPlayers={players.length}
                        currentPlayerIndex={currentPlayerIndex}
                    />

                    {/* Current player's team snapshot */}
                    <div
                        className="glass mt-4 p-3 rounded-2xl"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <h3
                            className="font-cinzel text-xs font-bold mb-2"
                            style={{ color: 'var(--accent-gold)' }}
                        >
                            {currentPlayer.name}'s Team
                        </h3>
                        <div className="space-y-1">
                            {ROLE_DEFINITIONS.map((slot) => {
                                const char = currentPlayer.team[slot.key];
                                const color = ROLE_COLORS[slot.key];
                                return (
                                    <div key={slot.key} className="flex items-center gap-1.5">
                                        <span style={{ fontSize: '10px' }}>{slot.icon}</span>
                                        <span
                                            style={{
                                                flex: 1,
                                                fontSize: '10px',
                                                fontFamily: 'Cinzel, serif',
                                                color: char ? color : 'var(--text-muted)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {slot.label}
                                        </span>
                                        {char ? (
                                            <CharacterAvatar
                                                character={char}
                                                size={20}
                                                borderRadius="3px"
                                                borderStyle={`1px solid ${color}50`}
                                                objectPosition="top"
                                                fontSize={7}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.15)',
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div
                            style={{
                                marginTop: '8px',
                                fontSize: '10px',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                fontFamily: 'Cinzel, serif',
                            }}
                        >
                            {countFilledRoles(currentPlayer.team)}/{TOTAL_ROLES} filled
                        </div>
                    </div>
                </div>

                {/* Center: Card Grid */}
                <div className="flex-1 flex items-start justify-center pt-4">
                    <CardGrid
                        availableCharacters={availableCharacters}
                        isActivePlayer={drawnCharacter === null}
                        onDraw={drawCard}
                    />
                </div>

                {/* Right: All players mini-scoreboard */}
                <div style={{ width: '170px', flexShrink: 0 }}>
                    <div
                        className="glass p-3 rounded-2xl"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <h3
                            className="font-cinzel text-xs font-bold mb-3"
                            style={{ color: 'var(--accent-gold)' }}
                        >
                            All Teams
                        </h3>
                        <div className="space-y-3">
                            {players.map((p, i) => {
                                const filled = countFilledRoles(p.team);
                                const pct = (filled / TOTAL_ROLES) * 100;
                                const isActive = i === currentPlayerIndex;
                                return (
                                    <div key={p.id}>
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontFamily: 'Inter',
                                                    color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                                                    fontWeight: isActive ? '600' : '400',
                                                }}
                                            >
                                                {isActive ? '▶ ' : ''}{p.name}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '10px',
                                                    color: filled === TOTAL_ROLES ? '#34d399' : 'var(--text-muted)',
                                                    fontFamily: 'Cinzel',
                                                }}
                                            >
                                                {filled}/{TOTAL_ROLES}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${pct}%`,
                                                    background:
                                                        filled === TOTAL_ROLES
                                                            ? 'linear-gradient(90deg, #34d399, #059669)'
                                                            : isActive
                                                                ? 'linear-gradient(90deg, #f97316, #dc2626)'
                                                                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                    borderRadius: 2,
                                                    transition: 'width 0.5s ease',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Character drawn modal */}
            {drawnCharacter && (
                <DrawnCharacterModal
                    character={drawnCharacter}
                    currentPlayer={currentPlayer}
                    onAssignRole={(key) => assignRole(key as RoleKey)}
                    onSkip={useSkip}
                />
            )}
        </div>
    );
}
