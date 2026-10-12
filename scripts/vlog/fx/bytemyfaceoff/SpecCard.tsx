import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { MONO, useUiScale } from '@neon/fx-kit';
import { Backdrop } from './Backdrop.tsx';
import { LANES, LINE, MUTED, PANEL, TEXT, fadeOut, rise } from './tokens.ts';

const KEYWORDS = /\b(SHALL|MUST|WHEN|THEN|GIVEN|AND)\b/g;

/** A spec file in an editor window, typed out line by line with its keywords lit. */
export const SpecCard: React.FC<{ path: string; text: string; charsPerSecond: number; backdrop: number }> = ({ path, text, charsPerSecond, backdrop }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useUiScale();
  const inn = rise(frame, fps, 0, 0.5);
  let budget = Math.max(0, (frame / fps - 0.4) * charsPerSecond);
  const lines = text.split('\n').map((line) => {
    const shown = line.slice(0, Math.max(0, Math.floor(budget)));
    budget -= line.length + 6; // a short beat at each line end
    return shown;
  });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, fps, durationInFrames) }}>
      <Backdrop opacity={backdrop * inn} s={s}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 1400 * s, background: PANEL, borderRadius: 18 * s, border: `${2 * s}px solid ${LINE}`, overflow: 'hidden', opacity: inn, transform: `scale(${0.96 + 0.04 * inn})` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 * s, padding: `${18 * s}px ${24 * s}px`, borderBottom: `${2 * s}px solid ${LINE}`, fontFamily: MONO, fontSize: 22 * s, color: MUTED }}>
              {LANES.slice(0, 3).map((c) => <span key={c} style={{ width: 14 * s, height: 14 * s, borderRadius: 99, background: c, display: 'inline-block' }} />)}
              <span style={{ marginLeft: 16 * s }}>{path}</span>
            </div>
            <div style={{ padding: `${30 * s}px ${36 * s}px`, fontFamily: MONO, fontSize: 30 * s, lineHeight: 1.7, color: TEXT, minHeight: 300 * s }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 28 * s }}>
                  <span style={{ color: MUTED, width: 30 * s, textAlign: 'right' }}>{i + 1}</span>
                  <span>{line.split(KEYWORDS).map((part, k) => (k % 2 ? <b key={k} style={{ color: LANES[0] }}>{part}</b> : part))}</span>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Backdrop>
    </AbsoluteFill>
  );
};
