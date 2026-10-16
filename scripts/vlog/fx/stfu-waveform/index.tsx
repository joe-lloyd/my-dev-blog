import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from '@neon/motion';

type Props = { scene: string; title: string; subtitle: string; chapter: string; image: string };
const cyan = '#8fd6ff';
const pink = '#f5276c';
const ink = '#080d19';
const muted = '#94a5bc';
const ease = (n: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, n)), 3);
const bars = Array.from({ length: 64 }, (_, i) => i);
const font = 'Inter, Segoe UI, Arial, sans-serif';
const panel: React.CSSProperties = { background: '#111d30', border: '1px solid #26364d', borderRadius: 24, padding: 32, boxSizing: 'border-box' };
const label: React.CSSProperties = { fontSize: 22, color: muted, letterSpacing: 3, textTransform: 'uppercase' };
const demoText = 'Can you send the notes to the team and put the screenshots in the folder?';
const steps = ['Hold key', 'Microphone', 'Whisper', 'LLM cleanup', 'Paste'];
const stepNotes = ['Start a take', 'Audio', 'Raw transcript', 'System prompt', 'Focused app'];
// Pipeline boxes have fixed geometry so the labels layer can sit on them.
const step = { left: 120, top: 490, width: 276, height: 150, arrow: 76 };
const stepLeft = (i: number) => step.left + i * (step.width + step.arrow);
const isCentred = (scene: string) => ['title', 'outro', 'end'].includes(scene);
const shows = ['demo', 'compare', 'pill', 'cloud', 'local', 'settings', 'history', 'languages'];

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

/** Kicker, title and subtitle flow together. Each layer draws its own part and keeps the rest's space. */
const Head: React.FC<Props & { part: 'title' | 'labels'; opacity: number; lift: number }> = ({ scene, title, subtitle, chapter, image, part, opacity, lift }) => {
  const shot = Boolean(image);
  const centred = isCentred(scene);
  const own = (mine: boolean): React.CSSProperties => ({ visibility: mine ? 'visible' : 'hidden' });
  return <div style={{ position: 'absolute', left: centred ? 0 : 120, right: centred ? 0 : undefined, top: centred ? 290 : 210, width: shot ? 870 : undefined, textAlign: centred ? 'center' : 'left', opacity, transform: `translateY(${lift}px)` }}>
    <div style={{ ...label, ...own(part === 'labels'), color: cyan, marginBottom: 30 }}>{centred ? 'Built by Joe Lloyd' : 'stfu / ' + chapter}</div>
    <div style={{ ...own(part === 'title'), fontSize: centred ? scene === 'title' && title === 'stfu' ? 230 : 110 : shot ? 84 : 100, fontWeight: 750, letterSpacing: -4, lineHeight: 1.1, maxWidth: shot ? 900 : undefined }}>{title}</div>
    {centred || shot || !['quote', 'demo'].includes(scene) ? <div style={{ ...own(part === 'labels'), fontSize: shot ? 34 : 36, color: muted, marginTop: 35, lineHeight: 1.5, maxWidth: shot ? 780 : undefined }}>{subtitle}</div> : null}
  </div>;
};

/** The heading and the one graphic a shot is about. Transparent, so the background shows through. */
export const StfuStage: React.FC<Props> = ({ scene, title, subtitle, image }) => {
  const { frame, t, pillPhase, waveColor, scale, outro } = useStage();
  const intro = ease(frame / 22);
  const shot = Boolean(image);
  const centred = isCentred(scene);
  const pill = <Pill t={t} phase={pillPhase} color={waveColor} />;
  let content: React.ReactNode = null;
  if (shot) {
    content = <div style={{ position: 'absolute', right: 100, top: 140, width: 700, height: 800, background: '#16161a', borderRadius: 24, overflow: 'hidden', border: '1px solid #334158', boxShadow: '0 35px 90px #0008', transform: `translateY(${(1 - intro) * 30}px)` }}><Img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} /></div>;
  } else if (scene === 'pipeline') {
    content = steps.map((name, i) => {
      const reveal = ease((frame - i * 14) / 20);
      const active = Math.floor(t / 2) % 5 === i;
      return <React.Fragment key={name}>
        <div style={{ ...panel, position: 'absolute', left: stepLeft(i), top: step.top, width: step.width, height: step.height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 650, opacity: reveal, transform: `translateY(${(1 - reveal) * 35}px)`, borderColor: active ? cyan : '#26364d' }}>{name}</div>
        {i < 4 && <div style={{ position: 'absolute', left: stepLeft(i) + step.width, width: step.arrow, top: step.top, height: step.height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: cyan, opacity: reveal }}>→</div>}
      </React.Fragment>;
    });
  } else if (scene === 'compare') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 470, display: 'flex', gap: 32 }}>
      {[['Whisper heard', 'um can you send the notes to the team and uh put the screenshots in the folder', muted], ['Cleanup returned', demoText, cyan]].map(([name, text, color]) => <div key={name} style={{ ...panel, flex: 1, minHeight: 270 }}><div style={{ ...label, color }}>{name}</div><div style={{ fontSize: 35, lineHeight: 1.5, marginTop: 30 }}>{text}</div></div>)}
    </div>;
  } else if (scene === 'demo') {
    const pasted = t % 12 > 8.5;
    content = <>
      <div style={{ ...panel, position: 'absolute', left: 160, right: 160, top: 420, height: 300, padding: 46, display: 'flex', alignItems: 'center', fontSize: 40, lineHeight: 1.5, color: pasted ? '#f2f6ff' : '#586b85' }}><div>{pasted ? demoText : 'Speak your message…'}<span style={{ color: cyan, opacity: Math.sin(t * 5) > 0 ? 1 : 0 }}>│</span></div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 765, display: 'flex', justifyContent: 'center' }}>{pill}</div>
    </>;
  } else if (scene === 'pill') {
    content = <div style={{ position: 'absolute', left: 0, right: 0, top: 564, display: 'flex', justifyContent: 'center' }}><div style={{ transform: 'scale(2.5)' }}>{pill}</div></div>;
  } else if (scene === 'speed') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 465 }}><div style={{ fontSize: 180, color: cyan, fontWeight: 750, letterSpacing: -10 }}>2.5<span style={{ color: pink }}>×</span></div><div style={{ width: 1000, display: 'grid', gap: 24, marginTop: 25 }}>{[['Typing', 0.4, muted], ['Talking', 1, cyan]].map(([name, size, color]) => <div key={name} style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 28 }}><span style={{ width: 130 }}>{name}</span><div style={{ width: `${Number(size) * ease(frame / 60) * 700}px`, height: 24, background: String(color), borderRadius: 12 }} /></div>)}</div></div>;
  } else if (scene === 'ownership' || scene === 'retention') {
    const items = scene === 'ownership' ? ['The recording', 'The raw transcript', 'The cleanup prompt', 'The pasted text'] : ['Lossless audio compression', 'Separate audio and text limits', 'Review before deleting', 'Transcripts can outlive audio'];
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 470, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>{items.map((item, i) => <div key={item} style={{ ...panel, fontSize: 32, opacity: ease((frame - i * 12) / 22) }}>{item}</div>)}</div>;
  } else if (scene === 'fallback') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 490, display: 'flex', alignItems: 'center', gap: 45 }}><div style={{ ...panel, fontSize: 34, color: '#ffbf69' }}>Cleanup unavailable</div><div style={{ fontSize: 60, color: cyan }}>→</div><div style={{ ...panel, flex: 1, fontSize: 34 }}>Paste the raw transcript</div></div>;
  } else if (centred) {
    content = <div style={{ position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', gap: 26, fontSize: 26, color: cyan }}>{scene === 'outro' ? ['macOS', 'Windows', 'Linux'].map(x => <span key={x} style={{ ...panel, padding: '16px 35px' }}>{x}</span>) : pill}</div>;
  } else {
    content = <div style={{ position: 'absolute', left: 120, top: 475, width: 1050, borderLeft: `5px solid ${cyan}`, padding: '24px 0 24px 40px', fontSize: 43, lineHeight: 1.5, color: '#bbc9db' }}>{subtitle}</div>;
  }
  return <Canvas scale={scale} opacity={outro}>
    <Head scene={scene} title={title} subtitle={subtitle} chapter="" image={image} part="title" opacity={intro} lift={(1 - intro) * 25} />
    {content}
  </Canvas>;
};

/** Brand, chapter, kicker, subtitle, footer and the small notes on diagrams. Delete a clip to drop its labels. */
export const StfuLabels: React.FC<Props> = ({ scene, title, subtitle, chapter, image }) => {
  const { frame, pillPhase, waveColor, scale, outro } = useStage();
  const late = ease((frame - 12) / 22);
  return <Canvas scale={scale} opacity={outro}>
    <div style={{ position: 'absolute', top: 55, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 3, color: muted }}><span><span style={{ color: pink }}>●</span> byteMyFaceOff</span><span>{chapter}</span></div>
    <Head scene={scene} title={title} subtitle={subtitle} chapter={chapter} image={image} part="labels" opacity={late} lift={0} />
    {scene === 'pipeline' && steps.map((_, i) => <React.Fragment key={i}>
      <div style={{ position: 'absolute', left: stepLeft(i), width: step.width, top: step.top + step.height + 22, textAlign: 'center', fontSize: 22, color: muted, opacity: ease((frame - i * 14 - 10) / 20) }}>{stepNotes[i]}</div>
    </React.Fragment>)}
    {scene === 'demo' && <div style={{ position: 'absolute', left: 0, right: 0, top: 857, textAlign: 'center', fontSize: 23, color: waveColor }}>{pillPhase === 'recording' ? 'Hold Ctrl + Win' : pillPhase === 'processing' ? 'Release. Transcribing and cleaning.' : 'Pasted into the focused app'}</div>}
    {scene === 'pill' && <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 70, fontSize: 28 }}>{[['Recording', cyan], ['Processing', '#f5c542'], ['Done', '#3ddc84']].map(([text, color]) => <div key={text} style={{ color, opacity: text.toLowerCase() === pillPhase ? 1 : 0.35 }}>{text}</div>)}</div>}
    <div style={{ position: 'absolute', bottom: 42, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#72859e' }}><span>STFU · A PROJECT BY JOE LLOYD</span><span>{shows.includes(scene) ? 'UI demonstration · example text' : 'github.com/joe-lloyd/stfu'}</span></div>
  </Canvas>;
};
