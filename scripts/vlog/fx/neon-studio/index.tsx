import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from '@neon/motion';

// Neon Video Studio's own look: near-black, neon pink and cyan, mono timecodes, timeline strips.
const ink = '#07070c';
const pink = '#ff2d78';
const cyan = '#00f3ff';
const green = '#39ff88';
const violet = '#a46bff';
const text = '#eef1ff';
const muted = '#8a90a8';
const glass = '#11121c';
const edge = '#262838';
const accents = [pink, cyan, green, violet];
const sans = 'Inter, Segoe UI, Arial, sans-serif';
const mono = 'JetBrains Mono, Menlo, Consolas, monospace';
const ease = (n: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, n)), 3);
const glow = (c: string, r = 24) => `0 0 ${r}px ${c}88, 0 0 ${r * 2}px ${c}33`;
/** Multiline fields hold one entry per line. */
const lines = (s: string) => s.split('\n').map(l => l.trimEnd()).filter(l => l.trim());
/** "Name: detail" entries. */
const pair = (line: string) => {
  const at = line.indexOf(':');
  return at < 0 ? [line.trim(), ''] : [line.slice(0, at).trim(), line.slice(at + 1).trim()];
};
const timecode = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(frame % fps)}`;
};

const useClock = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  return { frame, fps, t: frame / fps, scale: Math.min(width / 1920, height / 1080), fade: Math.min(1, Math.max(0, (durationInFrames - frame) / 10)) };
};
const Canvas: React.FC<{ scale: number; opacity?: number; children: React.ReactNode }> = ({ scale, opacity = 1, children }) => (
  <AbsoluteFill style={{ color: text, fontFamily: sans, overflow: 'hidden' }}>
    <div style={{ width: 1920, height: 1080, position: 'absolute', transformOrigin: 'top left', transform: `scale(${scale})`, opacity }}>{children}</div>
  </AbsoluteFill>
);
const Window: React.FC<{ title: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ title, style, children }) => (
  <div style={{ position: 'absolute', background: glass, border: `1px solid ${edge}`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 80px #000a', ...style }}>
    <div style={{ height: 46, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', borderBottom: `1px solid ${edge}`, fontFamily: mono, fontSize: 18, color: muted }}>
      {['#ff5f57', '#febc2e', '#28c840'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: 12, background: c }} />)}
      <span style={{ marginLeft: 12 }}>{title}</span>
    </div>
    {children}
  </div>
);

/** Ruler ticks, a slow playhead sweep and two glows. Put one clip under the whole video. */
export const NeonBackground: React.FC = () => {
  const { frame, fps, t, scale } = useClock();
  const sweep = ((t * 60) % 2200) - 140;
  return <Canvas scale={scale}>
    <AbsoluteFill style={{ background: ink }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 85% 0%, ${pink}22, transparent 55%), radial-gradient(ellipse at 0% 100%, ${cyan}1c, transparent 50%)` }} />
    <svg width="1920" height="1080" style={{ position: 'absolute', opacity: 0.08 }}><defs><pattern id="g" width="96" height="96" patternUnits="userSpaceOnUse"><path d="M 96 0 L 0 0 0 96" fill="none" stroke={cyan} strokeWidth="1" /></pattern></defs><rect width="1920" height="1080" fill="url(#g)" /></svg>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, borderTop: `1px solid ${edge}`, opacity: 0.55 }}>
      {Array.from({ length: 81 }, (_, i) => <div key={i} style={{ position: 'absolute', left: i * 24, bottom: 0, width: 1, height: i % 5 ? 10 : 22, background: muted }} />)}
      <div style={{ position: 'absolute', left: sweep, bottom: 0, width: 2, height: 1080, background: pink, boxShadow: glow(pink, 10), opacity: 0.6 }} />
      <div style={{ position: 'absolute', right: 40, bottom: 26, fontFamily: mono, fontSize: 18, color: muted }}>{timecode(frame, fps)}</div>
    </div>
  </Canvas>;
};

type StageProps = { scene: string; chapter: string; title: string; items: string; image: string };

/** One full-frame graphic: chapter, title and a scene drawn from Items. Every word comes from a field. */
export const NeonStage: React.FC<StageProps> = ({ scene, chapter, title, items, image }) => {
  const { frame, fps, t, scale, fade } = useClock();
  const intro = ease(frame / 20);
  const list = lines(items);
  const at = (i: number, gap = 12) => ease((frame - 10 - i * gap) / 18);
  const centred = scene === 'title' || scene === 'end';
  let body: React.ReactNode = null;

  if (image) {
    body = <div style={{ position: 'absolute', left: 120, right: 120, top: 330, bottom: 110, borderRadius: 18, overflow: 'hidden', border: `1px solid ${edge}`, boxShadow: `0 30px 90px #000c, ${glow(cyan, 8)}`, opacity: intro, transform: `translateY(${(1 - intro) * 30}px)`, background: glass }}><Img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>;
  } else if (scene === 'title' || scene === 'end') {
    // Items: a clip label per line, laid out as a timeline strip under the title.
    body = <div style={{ position: 'absolute', left: 260, right: 260, top: 690, height: 54, display: 'flex', gap: 8 }}>{list.map((l, i) => <div key={i} style={{ flex: `${1 + (i % 3) * 0.6} 0 auto`, whiteSpace: 'nowrap', borderRadius: 8, background: `${accents[i % 4]}2a`, border: `1px solid ${accents[i % 4]}`, color: accents[i % 4], fontFamily: mono, fontSize: 18, display: 'flex', alignItems: 'center', padding: '0 14px', opacity: at(i, 6), transform: `scaleX(${at(i, 6)})`, transformOrigin: 'left' }}>{l}</div>)}</div>;
  } else if (scene === 'flow') {
    // Items: a box per line, "Name: detail".
    const n = Math.max(1, list.length), arrow = 70, w = (1680 - (n - 1) * arrow) / n;
    body = list.map(pair).map(([name, detail], i) => <React.Fragment key={i}>
      <div style={{ position: 'absolute', left: 120 + i * (w + arrow), top: 470, width: w, height: 190, boxSizing: 'border-box', padding: 24, borderRadius: 18, background: glass, border: `1px solid ${Math.floor(t * 0.7) % n === i ? accents[i % 4] : edge}`, boxShadow: Math.floor(t * 0.7) % n === i ? glow(accents[i % 4], 14) : 'none', opacity: at(i), transform: `translateY(${(1 - at(i)) * 30}px)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: accents[i % 4] }}>{name}</div>
        {detail && <div style={{ fontSize: 22, color: muted, marginTop: 12, lineHeight: 1.4 }}>{detail}</div>}
      </div>
      {i < n - 1 && <div style={{ position: 'absolute', left: 120 + i * (w + arrow) + w, width: arrow, top: 470, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: muted, opacity: at(i) }}>→</div>}
    </React.Fragment>);
  } else if (scene === 'hub') {
    // Items: line 1 is the centre, the rest orbit it as "Name: detail". Packets run along the links.
    const [centre, ...spokes] = list.map(pair);
    const cx = 960, cy = 690, r = 300;
    const pos = spokes.map((_, i) => { const a = Math.PI + (i / Math.max(1, spokes.length - 1)) * Math.PI; return [cx + Math.cos(a) * r * 2.2, cy + Math.sin(a) * r * 0.95]; });
    body = <>
      <svg width="1920" height="1080" style={{ position: 'absolute' }}>{pos.map(([x, y], i) => { const p = (t * 0.6 + i * 0.27) % 1; return <g key={i} opacity={at(i + 1)}><line x1={cx} y1={cy} x2={x} y2={y} stroke={edge} strokeWidth="2" /><circle cx={cx + (x - cx) * p} cy={cy + (y - cy) * p} r="6" fill={accents[i % 4]} /></g>; })}</svg>
      {centre && <div style={{ position: 'absolute', left: cx - 190, top: cy - 70, width: 380, height: 140, boxSizing: 'border-box', borderRadius: 22, background: glass, border: `2px solid ${pink}`, boxShadow: glow(pink, 20), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: at(0) }}><div style={{ fontSize: 34, fontWeight: 750 }}>{centre[0]}</div>{centre[1] && <div style={{ fontSize: 20, color: muted, marginTop: 8 }}>{centre[1]}</div>}</div>}
      {spokes.map(([name, detail], i) => <div key={i} style={{ position: 'absolute', left: pos[i][0] - 150, top: pos[i][1] - 50, width: 300, minHeight: 100, boxSizing: 'border-box', padding: 18, borderRadius: 16, background: glass, border: `1px solid ${accents[i % 4]}`, textAlign: 'center', opacity: at(i + 1) }}><div style={{ fontSize: 26, fontWeight: 700, color: accents[i % 4] }}>{name}</div>{detail && <div style={{ fontSize: 19, color: muted, marginTop: 6 }}>{detail}</div>}</div>)}
    </>;
  } else if (scene === 'terminal') {
    // Items: commands typed one after another; lines starting with ">" are output.
    let clock = 8;
    const shown = list.map(l => { const out = l.startsWith('>'); const s = out ? l.slice(1).trim() : l; const start = clock; clock += out ? 6 : s.length * 0.9 + 14; return { out, s, start }; });
    body = <Window title="neon-cli" style={{ left: 160, right: 160, top: 330, bottom: 110 }}><div style={{ padding: '26px 34px', fontFamily: mono, fontSize: 28, lineHeight: 1.65 }}>{shown.map(({ out, s, start }, i) => { const typed = out ? (frame >= start ? s : '') : s.slice(0, Math.max(0, Math.floor((frame - start) / 0.9))); return frame >= start ? <div key={i} style={{ color: out ? muted : text, whiteSpace: 'pre' }}>{out ? '' : <span style={{ color: green }}>$ </span>}{typed}</div> : null; })}<span style={{ color: cyan, opacity: Math.sin(t * 6) > 0 ? 1 : 0 }}>▌</span></div></Window>;
  } else if (scene === 'code') {
    // Items: line 1 is the file name, the rest is the code, revealed a line at a time.
    const [file = '', ...code] = list;
    body = <Window title={file} style={{ left: 160, right: 160, top: 330, bottom: 110 }}><div style={{ padding: '22px 30px', fontFamily: mono, fontSize: 25, lineHeight: 1.6 }}>{code.map((l, i) => <div key={i} style={{ display: 'flex', gap: 26, opacity: at(i, 5), whiteSpace: 'pre' }}><span style={{ color: '#4a4e66', width: 34, textAlign: 'right' }}>{i + 1}</span><span style={{ color: /^\s*(\/\/|#)/.test(l) ? muted : text }}>{l}</span></div>)}</div></Window>;
  } else if (scene === 'feed') {
    // Items: events that land one by one, like the app's Live panel. "Source: event".
    body = <Window title="LIVE" style={{ left: 520, right: 520, top: 340, bottom: 110 }}><div style={{ padding: 20, display: 'grid', gap: 12 }}>{list.map(pair).map(([src, ev], i) => { const a = ease((frame - 10 - i * 20) / 10); return <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, fontSize: 23 }}><span style={{ fontFamily: mono, fontSize: 16, color: cyan, border: `1px solid ${cyan}`, borderRadius: 6, padding: '3px 8px' }}>{src}</span><span>{ev}</span><span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 16, color: muted }}>{timecode(i * 41 + 300, fps).slice(3)}</span></div>; })}</div></Window>;
  } else if (scene === 'timeline') {
    // Items: a track per line, "Track: clip, clip, clip". The playhead sweeps across.
    const head = 280 + ((t * 140) % 1400);
    body = <div style={{ position: 'absolute', left: 120, right: 120, top: 400, opacity: intro }}>{list.map(pair).map(([track, clips], r) => <div key={r} style={{ display: 'flex', alignItems: 'center', height: 92, borderBottom: `1px solid ${edge}` }}><div style={{ width: 140, fontFamily: mono, fontSize: 22, color: accents[r % 4] }}>{track}</div><div style={{ flex: 1, display: 'flex', gap: 6 }}>{clips.split(',').map(c => c.trim()).filter(Boolean).map((c, i) => <div key={i} style={{ flex: 1 + ((r + i) % 3) * 0.5, height: 60, borderRadius: 8, background: `${accents[r % 4]}26`, border: `1px solid ${accents[r % 4]}`, fontFamily: mono, fontSize: 19, display: 'flex', alignItems: 'center', padding: '0 12px', opacity: at(r * 3 + i, 4), whiteSpace: 'nowrap', overflow: 'hidden' }}>{c}</div>)}</div></div>)}<div style={{ position: 'absolute', left: head, top: -20, width: 2, height: list.length * 92 + 40, background: pink, boxShadow: glow(pink, 8) }} /></div>;
  } else if (scene === 'stats') {
    // Items: "Number: label" tiles; numbers count up.
    body = <div style={{ position: 'absolute', left: 120, right: 120, top: 450, display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, list.length))}, 1fr)`, gap: 28 }}>{list.map(pair).map(([num, label], i) => { const n = parseFloat(num.replace(/,/g, '')); const shownNum = Number.isFinite(n) ? Math.round(n * at(i, 10)).toLocaleString('en-GB') + num.replace(/^[\d.,]+/, '') : num; return <div key={i} style={{ background: glass, border: `1px solid ${edge}`, borderRadius: 20, padding: '34px 30px', opacity: at(i, 10) }}><div style={{ fontFamily: mono, fontSize: 84, fontWeight: 700, color: accents[i % 4], textShadow: glow(accents[i % 4], 12) }}>{shownNum}</div><div style={{ fontSize: 26, color: muted, marginTop: 12 }}>{label}</div></div>; })}</div>;
  } else if (scene === 'cards') {
    // Items: a card per line, "Name: detail".
    const cols = list.length > 4 ? 3 : 2;
    body = <div style={{ position: 'absolute', left: 120, right: 120, top: 400, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 22 }}>{list.map(pair).map(([name, detail], i) => <div key={i} style={{ background: glass, border: `1px solid ${edge}`, borderLeft: `4px solid ${accents[i % 4]}`, borderRadius: 16, padding: '24px 28px', opacity: at(i), transform: `translateY(${(1 - at(i)) * 24}px)` }}><div style={{ fontSize: 30, fontWeight: 700 }}>{name}</div>{detail && <div style={{ fontSize: 22, color: muted, marginTop: 10, lineHeight: 1.4 }}>{detail}</div>}</div>)}</div>;
  } else if (scene === 'split') {
    // Items: two panels, "Heading: text".
    body = <div style={{ position: 'absolute', left: 120, right: 120, top: 420, display: 'flex', gap: 30 }}>{list.slice(0, 2).map(pair).map(([h, s], i) => <div key={i} style={{ flex: 1, minHeight: 300, background: glass, border: `1px solid ${i ? cyan : edge}`, boxShadow: i ? glow(cyan, 10) : 'none', borderRadius: 20, padding: 36, opacity: at(i, 16) }}><div style={{ fontFamily: mono, fontSize: 22, letterSpacing: 2, color: i ? cyan : muted, textTransform: 'uppercase' }}>{h}</div><div style={{ fontSize: 36, lineHeight: 1.45, marginTop: 24 }}>{s}</div></div>)}</div>;
  } else if (list.length) {
    body = <div style={{ position: 'absolute', left: 120, top: 430, width: 1300, borderLeft: `5px solid ${pink}`, padding: '20px 0 20px 40px', fontSize: 46, lineHeight: 1.45, color: '#c9cde0', opacity: at(0) }}>{list.join(' ')}</div>;
  }

  return <Canvas scale={scale} opacity={fade}>
    {chapter && <div style={{ position: 'absolute', top: 56, right: 120, fontFamily: mono, fontSize: 21, letterSpacing: 2, color: muted }}>{chapter}</div>}
    <div style={{ position: 'absolute', left: centred ? 0 : 120, right: centred ? 0 : undefined, top: centred ? 360 : image ? 170 : 220, textAlign: centred ? 'center' : 'left', maxWidth: centred ? undefined : 1680, fontSize: centred ? 150 : image ? 80 : 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1.08, opacity: intro, transform: `translateY(${(1 - intro) * 24}px)`, textShadow: centred ? glow(pink, 30) : 'none' }}>{title}</div>
    {body}
  </Canvas>;
};
