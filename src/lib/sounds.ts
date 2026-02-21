/**
 * Synthesized sound engine using Web Audio API.
 * No external audio files needed — all sounds are generated procedurally.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function masterGain(ctx: AudioContext, vol = 0.5): GainNode {
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.connect(ctx.destination);
    return g;
}

// ─── Card hover: soft, quick tick ─────────────────────────────────────────────
export function playCardHover() {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = masterGain(ctx, 0.07);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    } catch { }
}

// ─── Card click / flip: swish + thud ──────────────────────────────────────────
export function playCardFlip() {
    try {
        const ctx = getCtx();

        // Noise burst (swish)
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);

        const gain = masterGain(ctx, 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        source.connect(filter);
        filter.connect(gain);
        source.start();
        source.stop(ctx.currentTime + 0.15);

        // Low thud at the end
        const osc = ctx.createOscillator();
        const thudGain = masterGain(ctx, 0.25);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.22);
        thudGain.gain.setValueAtTime(0.25, ctx.currentTime + 0.1);
        thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(thudGain);
        osc.start(ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.22);
    } catch { }
}

// ─── Reveal character: mystical shimmer ───────────────────────────────────────
export function playReveal() {
    try {
        const ctx = getCtx();
        const freqs = [523, 659, 784, 1047]; // C5, E5, G5, C6
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = masterGain(ctx, 0.12);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
            gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.06);
            gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.4);
            osc.connect(gain);
            osc.start(ctx.currentTime + i * 0.06);
            osc.stop(ctx.currentTime + i * 0.06 + 0.4);
        });
    } catch { }
}

// ─── Role assigned: punchy success chime ──────────────────────────────────────
export function playRoleAssigned() {
    try {
        const ctx = getCtx();
        // Rising arpeggio
        const notes = [392, 523, 659, 880]; // G4, C5, E5, A5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = masterGain(ctx, 0.15);
            osc.type = i === 3 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
            osc.connect(gain);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
    } catch { }
}

// ─── Skip: descending whoosh + low drone ──────────────────────────────────────
export function playSkip() {
    try {
        const ctx = getCtx();

        // Descending sweep
        const osc = ctx.createOscillator();
        const gain = masterGain(ctx, 0.2);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        osc.connect(filter);
        filter.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);

        // Sad low note
        const osc2 = ctx.createOscillator();
        const gain2 = masterGain(ctx, 0.15);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc2.connect(gain2);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.7);
    } catch { }
}

// ─── Round summary: fanfare burst ─────────────────────────────────────────────
export function playRoundSummary() {
    try {
        const ctx = getCtx();
        // Short triumphant fanfare
        const melody = [
            { freq: 523, t: 0, dur: 0.15 },
            { freq: 523, t: 0.15, dur: 0.08 },
            { freq: 784, t: 0.25, dur: 0.35 },
            { freq: 659, t: 0.28, dur: 0.3 },
        ];
        melody.forEach(({ freq, t, dur }) => {
            const osc = ctx.createOscillator();
            const gain = masterGain(ctx, 0.18);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
            gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
            osc.connect(gain);
            osc.start(ctx.currentTime + t);
            osc.stop(ctx.currentTime + t + dur);
        });
    } catch { }
}

// ─── Game over: full victory fanfare ──────────────────────────────────────────
export function playVictory() {
    try {
        const ctx = getCtx();
        const notes = [
            { freq: 523, t: 0 },
            { freq: 659, t: 0.12 },
            { freq: 784, t: 0.24 },
            { freq: 1047, t: 0.36 },
            { freq: 880, t: 0.52 },
            { freq: 1047, t: 0.62 },
        ];
        notes.forEach(({ freq, t }) => {
            const osc = ctx.createOscillator();
            const gain = masterGain(ctx, 0.2);
            osc.type = t > 0.5 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
            gain.gain.setValueAtTime(0.2, ctx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5);
            osc.connect(gain);
            osc.start(ctx.currentTime + t);
            osc.stop(ctx.currentTime + t + 0.5);
        });
    } catch { }
}
