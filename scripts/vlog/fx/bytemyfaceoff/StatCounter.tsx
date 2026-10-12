import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SANS, useUiScale } from '@neon/fx-kit';
import { Backdrop } from './Backdrop.tsx';
import { LANES, MUTED, PANEL, TEXT, easeOut, fadeOut, pairs, revealTimes, rise } from './tokens.ts';

/** A row of numbers that count up as each one is mentioned. Items are "number|label" lines. */
export const StatCounter: React.FC<{ title: string; items: string; reveal: string; countSeconds: number; backdrop: number }> = ({ title, items, reveal, countSeconds, backdrop }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useUiScale();
  const stats = pairs(items);
  const times = revealTimes(reveal, stats.length, 1);
  const inn = rise(frame, fps, 0, 0.5);
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, fps, durationInFrames) }}>
      <Backdrop opacity={backdrop * inn} s={s}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 60 * s, fontFamily: SANS }}>
          <div style={{ fontSize: 34 * s, letterSpacing: 4 * s, textTransform: 'uppercase', color: LANES[0], fontWeight: 700, opacity: inn }}>{title}</div>
          <div style={{ display: 'flex', gap: 34 * s }}>
            {stats.map((stat, i) => {
              const target = Number(stat.title.replace(/[^0-9.]/g, '')) || 0;
              const at = times[i]!;
              const shown = rise(frame, fps, at, 0.45);
              const counted = interpolate(frame, [at * fps, (at + countSeconds) * fps], [0, target], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut });
              const colour = LANES[i % LANES.length]!;
              return (
                <div key={i} style={{ width: 380 * s, padding: `${36 * s}px 0`, background: PANEL, borderRadius: 24 * s, borderTop: `${6 * s}px solid ${colour}`, textAlign: 'center', opacity: shown, transform: `translateY(${(1 - shown) * 50 * s}px)` }}>
                  <div style={{ fontSize: 96 * s, fontWeight: 800, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{Math.round(counted).toLocaleString('en-GB')}</div>
                  <div style={{ fontSize: 28 * s, color: MUTED, marginTop: 8 * s }}>{stat.sub}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
