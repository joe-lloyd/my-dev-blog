import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { SANS, useUiScale } from '@neon/fx-kit';
import { Backdrop } from './Backdrop.tsx';
import { LANES, MUTED, PANEL, TEXT, fadeOut, pairs, revealTimes, rise } from './tokens.ts';

/**
 * Numbered cards that land one at a time, the newest lit up. Items are "title|subtitle" lines.
 * `layout` column suits rules and steps; grid suits episode lists.
 */
export const CardList: React.FC<{ title: string; items: string; reveal: string; layout: string; firstNumber: number; backdrop: number }> = ({ title, items, reveal, layout, firstNumber, backdrop }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useUiScale();
  const cards = pairs(items);
  const times = revealTimes(reveal, cards.length, 1.2);
  const t = frame / fps;
  const active = times.reduce((a, at, i) => (t >= at ? i : a), -1);
  const inn = rise(frame, fps, 0, 0.5);
  const grid = layout === 'grid';
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, fps, durationInFrames) }}>
      <Backdrop opacity={backdrop * inn} s={s}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: SANS, gap: 44 * s }}>
          <div style={{ fontSize: 34 * s, letterSpacing: 4 * s, textTransform: 'uppercase', color: LANES[0], fontWeight: 700, opacity: inn }}>{title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: grid ? `repeat(2, ${620 * s}px)` : `${1100 * s}px`, gap: (grid ? 30 : 22) * s }}>
            {cards.map((card, i) => {
              const shown = rise(frame, fps, times[i]!, 0.5);
              const colour = LANES[i % LANES.length]!;
              const lit = i === active;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30 * s, padding: `${(grid ? 34 : 26) * s}px ${36 * s}px`, background: PANEL, borderRadius: 22 * s, border: `${3 * s}px solid ${lit ? colour : 'transparent'}`, boxShadow: lit ? `0 0 ${36 * s}px ${colour}55` : 'none', opacity: shown * (lit || active === -1 ? 1 : 0.65), transform: `translateX(${(1 - shown) * -60 * s}px)` }}>
                  <div style={{ minWidth: 76 * s, height: 76 * s, borderRadius: 999, background: colour, color: '#0B0D14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 * s, fontWeight: 800 }}>{firstNumber + i}</div>
                  <div>
                    <div style={{ fontSize: 40 * s, fontWeight: 800, color: TEXT }}>{card.title}</div>
                    {card.sub && <div style={{ fontSize: 26 * s, color: MUTED, marginTop: 6 * s }}>{card.sub}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
