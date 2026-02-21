/**
 * CharacterAvatar
 * Shows a character image if available, or a styled gradient card with
 * the character's initials when no image is present.
 */
'use client';

import Image from 'next/image';
import { Character } from '@/lib/types';

// Generate a consistent colour gradient from a character's name
function nameGradient(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1},70%,35%), hsl(${h2},80%,45%))`;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

interface CharacterAvatarProps {
    character: Character;
    /** Pixel size – used for both width and height */
    size: number;
    borderRadius?: string | number;
    /** Optional extra border style override */
    borderStyle?: string;
    objectPosition?: string;
    /** font size for the initials fallback — defaults to size/3 */
    fontSize?: number;
}

export default function CharacterAvatar({
    character,
    size,
    borderRadius = '50%',
    borderStyle,
    objectPosition = 'top',
    fontSize,
}: CharacterAvatarProps) {
    const hasImage = character.image && character.image.trim() !== '';
    const fs = fontSize ?? Math.round(size / 3);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: size,
        height: size,
        borderRadius,
        overflow: 'hidden',
        flexShrink: 0,
        border: borderStyle,
        background: hasImage ? undefined : nameGradient(character.name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    if (hasImage) {
        return (
            <div style={containerStyle}>
                <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    sizes={`${size}px`}
                    style={{ objectFit: 'cover', objectPosition }}
                />
            </div>
        );
    }

    // No image — render nothing; the name is shown separately by the parent
    return null;
}
