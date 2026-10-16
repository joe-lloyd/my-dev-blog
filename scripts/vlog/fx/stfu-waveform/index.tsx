import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from '@neon/motion';

const cyan = '#8fd6ff';
const pink = '#f5276c';
const ink = '#080d19';
const muted = '#94a5bc';
const ease = (n: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, n)), 3);
const bars = Array.from({ length: 64 }, (_, i) => i);
const font = 'Inter, Segoe UI, Arial, sans-serif';
const panel: React.CSSProperties = { background: '#111d30', border: '1px solid #26364d', borderRadius: 24, padding: 32, boxSizing: 'border-box' };
const label: React.CSSProperties = { fontSize: 22, color: muted, letterSpacing: 3, textTransform: 'uppercase' };
const isCentred = (scene: string) => ['title', 'outro', 'end'].includes(scene);

/** Shared clock and 1920 by 1080 canvas. Frame-based animation keeps preview and export identical. */
const useStage = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const pillPhase = t % 12 < 7 ? 'recording' : t % 12 < 8.5 ? 'processing' : 'done';
  const waveColor = pillPhase === 'processing' ? '#f5c542' : pillPhase === 'done' ? '#3ddc84' : cyan;
  return { frame, t, pillPhase, waveColor, scale: Math.min(width / 1920, height / 1080), outro: Math.min(1, Math.max(0, (durationInFrames - frame) / 10)) };
};
const Canvas: React.FC<{ scale: number; opacity?: number; children: React.ReactNode }> = ({ scale, opacity = 1, children }) => (
  <AbsoluteFill style={{ color: '#f1f5fb', fontFamily: font, overflow: 'hidden' }}>
    <div style={{ width: 1920, height: 1080, position: 'absolute', transformOrigin: 'top left', transform: `scale(${scale})`, opacity }}>{children}</div>
  </AbsoluteFill>
);

/** Ink, glow, grid and the slow waveform. One clip under the whole video keeps it moving across cuts. */
export const StfuBackground: React.FC = () => {
  const { t, scale } = useStage();
  return <Canvas scale={scale}>
    <AbsoluteFill style={{ background: ink }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 80% 5%, #16384b66, transparent 58%), radial-gradient(ellipse at 0% 100%, #3a0c2966, transparent 50%)' }} />
    <svg width="1920" height="1080" style={{ position: 'absolute', opacity: 0.07 }}><defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M 80 0 L 0 0 0 80" fill="none" stroke={cyan} strokeWidth="1" /></pattern></defs><rect width="1920" height="1080" fill="url(#grid)" /></svg>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: -65, display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', height: 300, opacity: 0.09 }}>{bars.map(i => <div key={i} style={{ width: 15, height: 18 + Math.abs(Math.sin(i * 0.31 + t * 0.6) * Math.cos(i * 0.12 - t * 0.3)) * 280, background: i % 9 === 0 ? pink : cyan, borderRadius: 10 }} />)}</div>
  </Canvas>;
};

const Pill: React.FC<{ t: number; phase: string; color: string }> = ({ t, phase, color }) => (
  <div style={{ width: 350, height: 72, borderRadius: 60, background: '#121216', border: '1px solid #2c3340', display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', boxSizing: 'border-box', boxShadow: '0 14px 40px #0008' }}>
    <div style={{ width: 10, height: 10, borderRadius: 10, background: phase === 'recording' ? '#ff4d4f' : color }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 38 }}>
      {bars.slice(0, 32).map(i => <div key={i} style={{ width: 5, borderRadius: 4, background: color, height: phase === 'done' ? 3 : 4 + 32 * Math.abs(Math.sin(i * 0.71 - t * 8) * Math.cos(i * 0.23 + t * 2)) }} />)}
    </div>
  </div>
);

/** Multiline fields hold one entry per line. */
const lines = (text: string) => text.split('\n').map(l => l.trim()).filter(Boolean);
/** "Heading: text" entries, for compare panels and speed rows. */
const pair = (line: string) => {
  const at = line.indexOf(':');
  return at < 0 ? [line, ''] : [line.slice(0, at).trim(), line.slice(at + 1).trim()];
};

type StageProps = { scene: string; chapter: string; title: string; items: string; image: string };

/** The part, title and one graphic a shot is about. Every word on screen comes from a field. */
export const StfuStage: React.FC<StageProps> = ({ scene, chapter, title, items, image }) => {
  const { frame, t, pillPhase, waveColor, scale, outro } = useStage();
  const intro = ease(frame / 22);
  const shot = Boolean(image);
  const centred = isCentred(scene);
  const list = lines(items);
  const pill = <Pill t={t} phase={pillPhase} color={waveColor} />;
  let content: React.ReactNode = null;
  if (shot) {
    content = <div style={{ position: 'absolute', right: 100, top: 140, width: 700, height: 800, background: '#16161a', borderRadius: 24, overflow: 'hidden', border: '1px solid #334158', boxShadow: '0 35px 90px #0008', transform: `translateY(${(1 - intro) * 30}px)` }}><Img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} /></div>;
  } else if (scene === 'pipeline') {
    const arrow = 76;
    const width = (1680 - (list.length - 1) * arrow) / Math.max(1, list.length);
    content = list.map((name, i) => {
      const reveal = ease((frame - i * 14) / 20);
      const left = 120 + i * (width + arrow);
      return <React.Fragment key={i}>
        <div style={{ ...panel, position: 'absolute', left, top: 490, width, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 30, fontWeight: 650, opacity: reveal, transform: `translateY(${(1 - reveal) * 35}px)`, borderColor: Math.floor(t / 2) % list.length === i ? cyan : '#26364d' }}>{name}</div>
        {i < list.length - 1 && <div style={{ position: 'absolute', left: left + width, width: arrow, top: 490, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: cyan, opacity: reveal }}>→</div>}
      </React.Fragment>;
    });
  } else if (scene === 'compare') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 470, display: 'flex', gap: 32 }}>
      {list.map(pair).map(([name, text], i) => <div key={i} style={{ ...panel, flex: 1, minHeight: 270 }}><div style={{ ...label, color: i ? cyan : muted }}>{name}</div><div style={{ fontSize: 35, lineHeight: 1.5, marginTop: 30 }}>{text}</div></div>)}
    </div>;
  } else if (scene === 'demo') {
    // Line 1 is the pasted message, line 2 the placeholder before it lands.
    const pasted = t % 12 > 8.5;
    content = <>
      <div style={{ ...panel, position: 'absolute', left: 160, right: 160, top: 420, height: 300, padding: 46, display: 'flex', alignItems: 'center', fontSize: 40, lineHeight: 1.5, color: pasted ? '#f2f6ff' : '#586b85' }}><div>{pasted ? list[0] : list[1]}<span style={{ color: cyan, opacity: Math.sin(t * 5) > 0 ? 1 : 0 }}>│</span></div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 765, display: 'flex', justifyContent: 'center' }}>{pill}</div>
    </>;
  } else if (scene === 'pill') {
    content = <div style={{ position: 'absolute', left: 0, right: 0, top: 564, display: 'flex', justifyContent: 'center' }}><div style={{ transform: 'scale(2.5)' }}>{pill}</div></div>;
  } else if (scene === 'speed') {
    // Line 1 is the big figure, then "Name: share" rows where share 1 is the full bar.
    const [figure, ...rows] = list;
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 465 }}><div style={{ fontSize: 180, color: cyan, fontWeight: 750, letterSpacing: -10 }}>{figure}</div><div style={{ width: 1000, display: 'grid', gap: 24, marginTop: 25 }}>{rows.map(pair).map(([name, share], i) => <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 28 }}><span style={{ width: 130 }}>{name}</span><div style={{ width: `${(Number(share) || 0) * ease(frame / 60) * 700}px`, height: 24, background: i === rows.length - 1 ? cyan : muted, borderRadius: 12 }} /></div>)}</div></div>;
  } else if (scene === 'ownership' || scene === 'retention') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 470, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>{list.map((item, i) => <div key={i} style={{ ...panel, fontSize: 32, opacity: ease((frame - i * 12) / 22) }}>{item}</div>)}</div>;
  } else if (scene === 'fallback') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 490, display: 'flex', alignItems: 'center', gap: 45 }}>{list.map((item, i) => <React.Fragment key={i}>{i > 0 && <div style={{ fontSize: 60, color: cyan }}>→</div>}<div style={{ ...panel, flex: i ? 1 : undefined, fontSize: 34, color: i ? undefined : '#ffbf69' }}>{item}</div></React.Fragment>)}</div>;
  } else if (centred) {
    content = <div style={{ position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', gap: 26, fontSize: 26, color: cyan }}>{list.length ? list.map((x, i) => <span key={i} style={{ ...panel, padding: '16px 35px' }}>{x}</span>) : pill}</div>;
  } else if (list.length) {
    content = <div style={{ position: 'absolute', left: 120, top: 420, width: 1050, borderLeft: `5px solid ${cyan}`, padding: '24px 0 24px 40px', fontSize: 43, lineHeight: 1.5, color: '#bbc9db' }}>{list.join(' ')}</div>;
  }
  return <Canvas scale={scale} opacity={outro}>
    {chapter && <div style={{ position: 'absolute', top: 55, right: 120, fontSize: 22, letterSpacing: 3, color: muted }}>{chapter}</div>}
    <div style={{ position: 'absolute', left: centred ? 0 : 120, right: centred ? 0 : undefined, top: centred ? 330 : 230, textAlign: centred ? 'center' : 'left', opacity: intro, transform: `translateY(${(1 - intro) * 25}px)`, fontSize: centred ? scene === 'title' && title === 'stfu' ? 230 : 110 : shot ? 84 : 100, fontWeight: 750, letterSpacing: -4, lineHeight: 1.1, maxWidth: shot ? 900 : centred ? undefined : 1680 }}>{title}</div>
    {content}
  </Canvas>;
};

type LabelProps = { brand: string; chapter: string; kicker: string; subtitle: string; caption: string; footer: string; footerNote: string };

/** Optional small text over a shot. Every label is a field; leave one empty to hide it. */
export const StfuLabels: React.FC<LabelProps> = ({ brand, chapter, kicker, subtitle, caption, footer, footerNote }) => {
  const { frame, scale, outro } = useStage();
  const late = ease((frame - 12) / 22);
  return <Canvas scale={scale} opacity={outro * late}>
    <div style={{ position: 'absolute', top: 55, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 3, color: muted }}><span>{brand && <><span style={{ color: pink }}>●</span> {brand}</>}</span><span>{chapter}</span></div>
    {kicker && <div style={{ ...label, position: 'absolute', left: 120, top: 180, color: cyan }}>{kicker}</div>}
    {subtitle && <div style={{ position: 'absolute', left: 120, top: 360, maxWidth: 1100, fontSize: 36, color: muted, lineHeight: 1.5 }}>{subtitle}</div>}
    {caption && <div style={{ position: 'absolute', left: 120, right: 120, top: 880, textAlign: 'center', fontSize: 26, color: muted }}>{caption}</div>}
    <div style={{ position: 'absolute', bottom: 42, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#72859e' }}><span>{footer}</span><span>{footerNote}</span></div>
  </Canvas>;
};
