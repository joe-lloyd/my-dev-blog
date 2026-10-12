import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { MONO, SANS, useUiScale } from '@neon/fx-kit';
import { Backdrop } from './Backdrop.tsx';
import { LANES, MUTED, PANEL, TEXT, fadeOut, pairs, revealTimes, rise } from './tokens.ts';

const ICONS: Record<string, string> = {
  desktop: 'M3 4h18v12H3z M8 20h8 M12 16v4',
  server: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  relay: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M7.5 7.5a6.4 6.4 0 0 0 0 9 M16.5 7.5a6.4 6.4 0 0 1 0 9 M4.6 4.6a10.5 10.5 0 0 0 0 14.8 M19.4 4.6a10.5 10.5 0 0 1 0 14.8',
  phone: 'M7 2h10v20H7z M11 18h2',
};
const KINDS = ['desktop', 'server', 'relay', 'phone'];
// Card centres at 1080p, clockwise from top-left.
const SLOTS = [
  { x: 440, y: 330 },
  { x: 1480, y: 330 },
  { x: 440, y: 770 },
  { x: 1480, y: 770 },
];
const HUB = { x: 960, y: 550 };

/** The Git Gud family: four apps around one peer protocol, revealed one at a time. */
export const FourApps: React.FC<{ title: string; hub: string; apps: string; reveal: string; backdrop: number }> = ({ title, hub, apps, reveal, backdrop }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useUiScale();
  const items = pairs(apps).slice(0, 4);
  const times = revealTimes(reveal, items.length, 3);
  const out = fadeOut(frame, fps, durationInFrames);
  const t = frame / fps;
  const active = times.reduce((a, at, i) => (t >= at ? i : a), -1);
  const hubIn = rise(frame, fps, 0, 0.8);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop opacity={backdrop * hubIn} s={s}>
        <div style={{ position: 'absolute', top: 70 * s, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 46 * s, color: TEXT, opacity: hubIn }}>
          {title}
        </div>
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
          {items.map((_, i) => {
            const slot = SLOTS[i]!;
            const draw = rise(frame, fps, times[i]! + 0.15, 0.7);
            const len = Math.hypot(slot.x - HUB.x, slot.y - HUB.y);
            const colour = LANES[i % LANES.length]!;
            // Two packets travel along each live link, out and back, at a fixed rate.
            const phase = ((frame - times[i]! * fps) / (fps * 1.6)) % 1;
            const packets = draw >= 1 ? [phase, (phase + 0.5) % 1] : [];
            return (
              <g key={i}>
                <line x1={slot.x} y1={slot.y} x2={HUB.x} y2={HUB.y} stroke={colour} strokeWidth={4} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} opacity={0.75} />
                {packets.map((p, k) => (
                  <circle key={k} cx={slot.x + (HUB.x - slot.x) * p} cy={slot.y + (HUB.y - slot.y) * p} r={7} fill={colour} />
                ))}
              </g>
            );
          })}
          <circle cx={HUB.x} cy={HUB.y} r={96 + 14 * Math.sin(frame / 9)} fill="none" stroke="#F5276C" strokeWidth={2} opacity={0.35 * hubIn} />
          <circle cx={HUB.x} cy={HUB.y} r={88 * hubIn} fill={PANEL} stroke="#F5276C" strokeWidth={4} />
        </svg>
        <div style={{ position: 'absolute', left: (HUB.x - 90) * s, top: (HUB.y - 32) * s, width: 180 * s, textAlign: 'center', whiteSpace: 'pre-line', fontFamily: MONO, fontSize: 26 * s, lineHeight: 1.3, color: TEXT, opacity: hubIn }}>
          {hub}
        </div>
        {items.map((item, i) => {
          const slot = SLOTS[i]!;
          const inn = rise(frame, fps, times[i]!, 0.55);
          const colour = LANES[i % LANES.length]!;
          const lit = i === active;
          const w = 540, h = 150;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (slot.x - w / 2) * s,
                top: (slot.y - h / 2) * s,
                width: w * s,
                height: h * s,
                display: 'flex',
                alignItems: 'center',
                gap: 26 * s,
                padding: `0 ${30 * s}px`,
                boxSizing: 'border-box',
                background: PANEL,
                border: `${3 * s}px solid ${colour}`,
                borderRadius: 22 * s,
                boxShadow: lit ? `0 0 ${40 * s}px ${colour}66` : 'none',
                opacity: inn,
                filter: active === -1 || lit ? 'none' : 'brightness(0.62)',
                transform: `translateY(${(1 - inn) * 40 * s}px) scale(${0.92 + 0.08 * inn})`,
              }}
            >
              <svg width={64 * s} height={64 * s} viewBox="0 0 24 24" fill="none" stroke={colour} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={ICONS[KINDS[i]!]} />
              </svg>
              <div style={{ fontFamily: SANS }}>
                <div style={{ fontSize: 36 * s, fontWeight: 800, color: TEXT }}>{item.title}</div>
                <div style={{ fontSize: 23 * s, color: MUTED, marginTop: 6 * s }}>{item.sub}</div>
              </div>
            </div>
          );
        })}
      </Backdrop>
    </AbsoluteFill>
  );
};

