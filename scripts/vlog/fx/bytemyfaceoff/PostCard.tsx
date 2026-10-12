import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SANS, useUiScale } from '@neon/fx-kit';
import { Backdrop } from './Backdrop.tsx';
import { LANES, MUTED, PANEL, TEXT, easeOut, fadeOut, rise } from './tokens.ts';

/** A blog post as a card, with an optional stamp that thumps on later, e.g. "2025". */
export const PostCard: React.FC<{ site: string; title: string; date: string; excerpt: string; stamp: string; stampAt: number; backdrop: number }> = ({ site, title, date, excerpt, stamp, stampAt, backdrop }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useUiScale();
  const inn = rise(frame, fps, 0, 0.6);
  const thump = interpolate(frame, [stampAt * fps, (stampAt + 0.25) * fps], [2.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut });
  const stampOpacity = interpolate(frame, [stampAt * fps, (stampAt + 0.12) * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, fps, durationInFrames) }}>
      <Backdrop opacity={backdrop * inn} s={s}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: SANS }}>
          <div style={{ position: 'relative', width: 1180 * s, padding: `${56 * s}px ${64 * s}px`, background: PANEL, borderRadius: 26 * s, borderLeft: `${10 * s}px solid ${LANES[0]}`, opacity: inn, transform: `translateY(${(1 - inn) * 40 * s}px) rotate(${(1 - inn) * -2}deg)` }}>
            <div style={{ fontSize: 24 * s, color: LANES[1], fontWeight: 700, letterSpacing: 2 * s, textTransform: 'uppercase' }}>{site}</div>
            <div style={{ fontSize: 66 * s, fontWeight: 800, color: TEXT, lineHeight: 1.1, marginTop: 18 * s }}>{title}</div>
            <div style={{ fontSize: 26 * s, color: MUTED, marginTop: 18 * s }}>{date}</div>
            {excerpt && <div style={{ fontSize: 32 * s, color: TEXT, opacity: 0.85, marginTop: 30 * s, lineHeight: 1.45 }}>{excerpt}</div>}
            {stamp && (
              <div style={{ position: 'absolute', right: 50 * s, top: -40 * s, padding: `${10 * s}px ${26 * s}px`, border: `${6 * s}px solid ${LANES[0]}`, color: LANES[0], borderRadius: 14 * s, fontSize: 54 * s, fontWeight: 900, transform: `rotate(-8deg) scale(${thump})`, opacity: stampOpacity }}>{stamp}</div>
            )}
          </div>
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
