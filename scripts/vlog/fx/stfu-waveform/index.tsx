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

/** Frame-based animation keeps the editor preview and exported picture identical. */
export const StfuStage: React.FC<Props> = ({ scene, title, subtitle, chapter, image }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const intro = ease(frame / 22);
  const outro = Math.min(1, Math.max(0, (durationInFrames - frame) / 10));
  const shot = Boolean(image);
  const centred = ['title', 'outro', 'end'].includes(scene);
  const pillPhase = t % 12 < 7 ? 'recording' : t % 12 < 8.5 ? 'processing' : 'done';
  const waveColor = pillPhase === 'processing' ? '#f5c542' : pillPhase === 'done' ? '#3ddc84' : cyan;
  const demoText = 'Can you send the notes to the team and put the screenshots in the folder?';
  const panel: React.CSSProperties = { background: '#111d30', border: '1px solid #26364d', borderRadius: 24, padding: 32 };
  const label: React.CSSProperties = { fontSize: 22, color: muted, letterSpacing: 3, textTransform: 'uppercase' };
  const pill = (
    <div style={{ width: 350, height: 72, borderRadius: 60, background: '#121216', border: '1px solid #2c3340', display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', boxShadow: '0 14px 40px #0008' }}>
      <div style={{ width: 10, height: 10, borderRadius: 10, background: pillPhase === 'recording' ? '#ff4d4f' : waveColor }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 38 }}>
        {bars.slice(0, 32).map(i => <div key={i} style={{ width: 5, borderRadius: 4, background: waveColor, height: pillPhase === 'done' ? 3 : 4 + 32 * Math.abs(Math.sin(i * 0.71 - t * 8) * Math.cos(i * 0.23 + t * 2)) }} />)}
      </div>
    </div>
  );
  let content: React.ReactNode;
  if (shot) {
    content = <div style={{ position: 'absolute', right: 100, top: 140, width: 700, height: 800, background: '#16161a', borderRadius: 24, overflow: 'hidden', border: '1px solid #334158', boxShadow: '0 35px 90px #0008', transform: `translateY(${(1 - intro) * 30}px)` }}><Img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} /></div>;
  } else if (scene === 'pipeline') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 490, display: 'flex', gap: 18 }}>
      {['Hold key', 'Microphone', 'Whisper', 'LLM cleanup', 'Paste'].map((name, i) => {
        const reveal = ease((frame - i * 14) / 20);
        const active = Math.floor(t / 2) % 5 === i;
        return <React.Fragment key={name}><div style={{ ...panel, flex: 1, padding: '35px 20px', opacity: reveal, transform: `translateY(${(1 - reveal) * 35}px)`, borderColor: active ? cyan : '#26364d' }}><div style={{ ...label, color: i === 2 || i === 3 ? pink : cyan, marginBottom: 22 }}>{String(i + 1).padStart(2, '0')}</div><div style={{ fontSize: 30, fontWeight: 650 }}>{name}</div><div style={{ marginTop: 18, fontSize: 20, color: muted }}>{['Start a take', 'Audio', 'Raw transcript', 'System prompt', 'Focused app'][i]}</div></div>{i < 4 && <div style={{ alignSelf: 'center', fontSize: 30, color: cyan }}>→</div>}</React.Fragment>;
      })}
    </div>;
  } else if (scene === 'compare') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 470, display: 'flex', gap: 32 }}>
      {[['Whisper heard', 'um can you send the notes to the team and uh put the screenshots in the folder', muted], ['Cleanup returned', demoText, cyan]].map(([name, text, color]) => <div key={name} style={{ ...panel, flex: 1, minHeight: 270 }}><div style={{ ...label, color }}>{name}</div><div style={{ fontSize: 35, lineHeight: 1.5, marginTop: 30 }}>{text}</div></div>)}
    </div>;
  } else if (scene === 'demo') {
    const pasted = t % 12 > 8.5;
    content = <div style={{ position: 'absolute', left: 160, right: 160, top: 420 }}><div style={{ ...panel, minHeight: 300, padding: 46 }}><div style={label}>A message to the team</div><div style={{ fontSize: 40, marginTop: 40, lineHeight: 1.5, color: pasted ? '#f2f6ff' : '#586b85' }}>{pasted ? demoText : 'Speak your message…'}<span style={{ color: cyan, opacity: Math.sin(t * 5) > 0 ? 1 : 0 }}>│</span></div></div><div style={{ marginTop: 45, display: 'flex', justifyContent: 'center' }}>{pill}</div><div style={{ textAlign: 'center', fontSize: 23, color: waveColor, marginTop: 20 }}>{pillPhase === 'recording' ? 'Hold Ctrl + Win' : pillPhase === 'processing' ? 'Release. Transcribing and cleaning.' : 'Pasted into the focused app'}</div></div>;
  } else if (scene === 'pill') {
    content = <div style={{ position: 'absolute', inset: '480px 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60 }}><div style={{ transform: 'scale(2.5)', margin: 50 }}>{pill}</div><div style={{ display: 'flex', gap: 70, fontSize: 28 }}>{[['Recording', cyan], ['Processing', '#f5c542'], ['Done', '#3ddc84']].map(([text, color]) => <div key={text} style={{ color }}>{text}</div>)}</div></div>;
  } else if (scene === 'speed') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 465 }}><div style={{ fontSize: 180, color: cyan, fontWeight: 750, letterSpacing: -10 }}>2.5<span style={{ color: pink }}>×</span></div><div style={{ width: 1000, display: 'grid', gap: 24, marginTop: 25 }}>{[['Typing', 0.4, muted], ['Talking', 1, cyan]].map(([name, size, color]) => <div key={name} style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 28 }}><span style={{ width: 130 }}>{name}</span><div style={{ width: `${Number(size) * ease(frame / 60) * 700}px`, height: 24, background: String(color), borderRadius: 12 }} /></div>)}</div></div>;
  } else if (scene === 'ownership' || scene === 'retention') {
    const items = scene === 'ownership' ? ['The recording', 'The raw transcript', 'The cleanup prompt', 'The pasted text'] : ['Lossless audio compression', 'Separate audio and text limits', 'Review before deleting', 'Transcripts can outlive audio'];
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 470, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>{items.map((item, i) => <div key={item} style={{ ...panel, fontSize: 32, opacity: ease((frame - i * 12) / 22) }}><span style={{ color: cyan, marginRight: 22 }}>0{i + 1}</span>{item}</div>)}</div>;
  } else if (scene === 'fallback') {
    content = <div style={{ position: 'absolute', left: 120, right: 120, top: 490, display: 'flex', alignItems: 'center', gap: 45 }}><div style={{ ...panel, fontSize: 34, color: '#ffbf69' }}>Cleanup unavailable</div><div style={{ fontSize: 60, color: cyan }}>→</div><div style={{ ...panel, flex: 1, fontSize: 34 }}>Paste the raw transcript<div style={{ fontSize: 25, color: muted, marginTop: 18 }}>The words are still useful.</div></div></div>;
  } else if (centred) {
    content = <div style={{ position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 26, fontSize: 26, color: cyan }}>{scene === 'outro' ? ['macOS', 'Windows', 'Linux'].map(x => <span key={x} style={{ ...panel, padding: '16px 35px' }}>{x}</span>) : pill}</div>;
  } else {
    content = <div style={{ position: 'absolute', left: 120, top: 475, width: 1050, borderLeft: `5px solid ${cyan}`, padding: '24px 0 24px 40px', fontSize: 43, lineHeight: 1.5, color: '#bbc9db' }}>{subtitle}</div>;
  }
  return <AbsoluteFill style={{ background: ink, color: '#f1f5fb', fontFamily: font, overflow: 'hidden' }}>
    <div style={{ width: 1920, height: 1080, position: 'absolute', transformOrigin: 'top left', transform: `scale(${Math.min(width / 1920, height / 1080)})`, opacity: outro }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 80% 5%, #16384b66, transparent 58%), radial-gradient(ellipse at 0% 100%, #3a0c2966, transparent 50%)' }} />
      <svg width="1920" height="1080" style={{ position: 'absolute', opacity: 0.07 }}><defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M 80 0 L 0 0 0 80" fill="none" stroke={cyan} strokeWidth="1" /></pattern></defs><rect width="1920" height="1080" fill="url(#grid)" /></svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -65, display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', height: 300, opacity: 0.09 }}>{bars.map(i => <div key={i} style={{ width: 15, height: 18 + Math.abs(Math.sin(i * 0.31 + t * 0.6) * Math.cos(i * 0.12 - t * 0.3)) * 280, background: i % 9 === 0 ? pink : cyan, borderRadius: 10 }} />)}</div>
      <div style={{ position: 'absolute', top: 55, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 3, color: muted }}><span><span style={{ color: pink }}>●</span> byteMyFaceOff</span><span>{chapter}</span></div>
      <div style={{ position: 'absolute', left: centred ? 0 : 120, right: centred ? 0 : undefined, top: centred ? 290 : 210, width: shot ? 870 : undefined, textAlign: centred ? 'center' : 'left', opacity: intro, transform: `translateY(${(1 - intro) * 25}px)` }}>
        <div style={{ ...label, color: cyan, marginBottom: 30 }}>{centred ? 'Built by Joe Lloyd' : 'stfu / '+chapter}</div>
        <div style={{ fontSize: centred ? scene === 'title' && title === 'stfu' ? 230 : 110 : shot ? 84 : 100, fontWeight: 750, letterSpacing: -4, lineHeight: 1.1, maxWidth: shot ? 900 : undefined }}>{title}</div>
        {centred || shot || !['quote', 'demo'].includes(scene) ? <div style={{ fontSize: shot ? 34 : 36, color: muted, marginTop: 35, lineHeight: 1.5, maxWidth: shot ? 780 : undefined }}>{subtitle}</div> : null}
      </div>
      {content}
      <div style={{ position: 'absolute', bottom: 42, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#72859e' }}><span>STFU · A PROJECT BY JOE LLOYD</span><span>{['demo', 'compare', 'pill', 'cloud', 'local', 'settings', 'history', 'languages'].includes(scene) ? 'UI demonstration · example text' : 'github.com/joe-lloyd/stfu'}</span></div>
    </div>
  </AbsoluteFill>;
};
