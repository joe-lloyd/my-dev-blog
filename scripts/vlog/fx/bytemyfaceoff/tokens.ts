/** byteMyFaceOff look: Git Gud's dark canvas and lane colours, pink as the lead accent. */
import { Easing, interpolate } from 'remotion';

export const BG = '#0B0D14';
export const PANEL = '#141826';
export const LINE = '#262B3D';
export const TEXT = '#F2F3F8';
export const MUTED = '#9095AB';
export const LANES = ['#F5276C', '#2DD4BF', '#F59E0B', '#A78BFA'] as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0 → 1 over `seconds`, starting at `at` seconds into the clip. */
export function rise(frame: number, fps: number, at: number, seconds = 0.6): number {
  return interpolate(frame, [at * fps, (at + seconds) * fps], [0, 1], { ...CLAMP, easing: easeOut });
}

/** 1 → 0 over the clip's last `seconds`. */
export function fadeOut(frame: number, fps: number, duration: number, seconds = 0.35): number {
  return interpolate(frame, [duration - seconds * fps, duration], [1, 0], CLAMP);
}

/** "0, 3.5, 8" → [0, 3.5, 8]; missing entries continue at `step` seconds apart. */
export function revealTimes(spec: string, count: number, step: number): number[] {
  const given = spec.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
  return Array.from({ length: count }, (_, i) => given[i] ?? (given.at(-1) ?? 0) + step * (i - given.length + 1));
}

/** Lines of "title|subtitle". */
export function pairs(text: string): { title: string; sub: string }[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [title = '', sub = ''] = l.split('|');
    return { title: title.trim(), sub: sub.trim() };
  });
}
