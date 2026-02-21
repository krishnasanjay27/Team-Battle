'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Character } from '@/lib/types';
import CharacterAvatar from './CharacterAvatar';
import { playCardFlip, playCardHover, playReveal } from '@/lib/sounds';

interface CardProps {
    character?: Character;
    isActive: boolean;
    isDisabled: boolean;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}

// Naruto-style SVG back design
function CardBackDesign() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="160" fill="url(#bg-grad)" rx="8" />
            <circle cx="60" cy="80" r="50" fill="none" stroke="#f9731630" strokeWidth="1" />
            <circle cx="60" cy="80" r="38" fill="none" stroke="#f9731640" strokeWidth="1.5" />
            <circle cx="60" cy="80" r="25" fill="none" stroke="#f9731650" strokeWidth="1" />
            <path
                d="M60 55 L65 70 L80 70 L68 79 L73 94 L60 85 L47 94 L52 79 L40 70 L55 70 Z"
                fill="#f9731440"
                stroke="#f97316"
                strokeWidth="0.8"
            />
            <text x="8" y="20" fontSize="12" fill="#f9731660">🍃</text>
            <text x="96" y="155" fontSize="12" fill="#f9731660" transform="rotate(180,102,148)">🍃</text>
            <text x="96" y="20" fontSize="12" fill="#dc262640">⚔</text>
            <text x="8" y="155" fontSize="12" fill="#dc262640">⚔</text>
            <text x="60" y="88" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#f9731660" fontFamily="Cinzel, serif">?</text>
            <defs>
                <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#12121a" />
                    <stop offset="100%" stopColor="#1a1a2e" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function Card({
    character,
    isActive,
    isDisabled,
    isSelected,
    onClick,
    index,
}: CardProps) {
    const innerRef = useRef<HTMLDivElement>(null);
    const hasFlipped = useRef(false);

    const handleClick = () => {
        if (isDisabled || hasFlipped.current) return;
        hasFlipped.current = true;

        // Flip via DOM ref — no React state update = no re-render during animation
        if (innerRef.current) {
            innerRef.current.style.transform = 'rotateY(180deg)';
        }

        // Play flip sound immediately
        playCardFlip();

        // Trigger state update (modal open) after the flip is halfway done (300ms)
        // Use requestAnimationFrame to ensure the flip CSS has been applied first
        requestAnimationFrame(() => {
            setTimeout(() => {
                playReveal();
                onClick();
            }, 320);
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: isSelected ? 0.12 : isDisabled ? 0.45 : 1,
                y: 0,
                scale: isSelected ? 0.9 : 1,
            }}
            transition={{ delay: index * 0.035, duration: 0.25 }}
            className="card-scene"
            style={{ width: '90px', height: '120px', willChange: 'opacity, transform' }}
        >
            <div
                ref={innerRef}
                className="card-inner"
                onMouseEnter={() => { if (!isDisabled && !hasFlipped.current) playCardHover(); }}
                style={{
                    cursor: isDisabled || hasFlipped.current ? 'default' : 'pointer',
                    willChange: 'transform',
                }}
                onClick={handleClick}
            >
                {/* BACK */}
                <div
                    className="card-face card-back"
                    style={{
                        border: isActive && !isDisabled
                            ? '2px solid rgba(249,115,22,0.7)'
                            : '2px solid rgba(249,115,22,0.2)',
                        boxShadow: isActive && !isDisabled
                            ? '0 0 14px rgba(249,115,22,0.35)'
                            : 'none',
                    }}
                >
                    <CardBackDesign />
                </div>

                {/* FRONT — character revealed */}
                <div className="card-face card-front" style={{ overflow: 'hidden' }}>
                    {character && (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'stretch' }}>
                            <CharacterAvatar
                                character={character}
                                size={90}
                                borderRadius="0"
                                objectPosition="top"
                                fontSize={26}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '3px 4px',
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
                                    fontSize: '7.5px',
                                    fontFamily: 'Cinzel, serif',
                                    fontWeight: '700',
                                    color: '#fbbf24',
                                    textAlign: 'center',
                                    lineHeight: '1.2',
                                }}
                            >
                                {character.name}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
