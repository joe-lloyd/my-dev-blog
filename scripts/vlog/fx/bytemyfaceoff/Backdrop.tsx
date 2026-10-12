import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BG, LINE } from './tokens.ts';

/** Full-frame dark backdrop with a faint grid, over whatever footage is below. */
export const Backdrop: React.FC<{ opacity: number; s: number; children?: React.ReactNode }> = ({ opacity, s, children }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background: BG,
        opacity,
        backgroundImage: `linear-gradient(${LINE}55 1px, transparent 1px), linear-gradient(90deg, ${LINE}55 1px, transparent 1px)`,
        backgroundSize: `${60 * s}px ${60 * s}px`,
      }}
    />
    {children}
  </AbsoluteFill>
);
