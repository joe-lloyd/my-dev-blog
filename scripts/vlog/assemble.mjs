// Build a Neon Video Studio project from an episode's recordings and voiceover.
//
// Usage: node assemble.mjs <episodeDir> <neonRepo> <projectDir.neon>
// Needs the Neon source checkout for its schema and template defaults. The result opens in
// the app like any project: footage on V1, the voiceover on VO, overlays on FX tracks.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [episodeDir, neonRepo, projectDir] = process.argv.slice(2).map((p) => resolve(p));
const neon = (p) => import(pathToFileURL(join(neonRepo, p)).href);
const core = await neon('packages/core/src/index.ts');
(await neon('apps/remotion-workspace/src/templates/packs/meta.ts')).registerAllPacks();

const episode = (await import(pathToFileURL(join(episodeDir, 'episode.mjs')).href)).default;
const out = join(episodeDir, 'out');
const tts = JSON.parse(readFileSync(join(out, 'tts.json'), 'utf8'));
const FPS = 30;
const f = (seconds) => Math.round(seconds * FPS);
const ACCENT = '#F5276C';

const now = new Date().toISOString();
const id = (prefix) => `${prefix}_${createHash('sha256').update(prefix + Math.random()).digest('hex').slice(0, 20)}`;
const track = (name, kind, order) => ({ id: id('trk'), name, kind, order, muted: false, locked: false, hidden: false });
const tracks = {
  video: track('V1', 'video', 0),
  vo: track('VO', 'audio', 1),
  dim: track('FX dim', 'overlay', 2),
  fx: track('FX', 'overlay', 3),
  clicks: track('Clicks', 'overlay', 4),
  brand: track('Brand', 'overlay', 5),
};
const assets = [];
const clips = [];

mkdirSync(join(projectDir, 'assets'), { recursive: true });
function addAsset(file, kind, extra) {
  const bytes = readFileSync(file);
  const sha = createHash('sha256').update(bytes).digest('hex');
  const ext = file.split('.').pop();
  const name = `${sha}.${ext}`;
  if (!existsSync(join(projectDir, 'assets', name))) copyFileSync(file, join(projectDir, 'assets', name));
  if (!assets.some((a) => a.id === sha)) {
    assets.push({ id: sha, name, kind, mime: kind === 'video' ? 'video/mp4' : 'audio/wav', size: bytes.length, importedAt: now, ...extra });
  }
  return { sha, name };
}
const media = (kind, trackId, file, startFrame, durationFrames, extra = {}) => {
  const { sha, name } = addAsset(file, kind, kind === 'video' ? { durationFrames, width: 1920, height: 1080, fps: FPS } : { durationFrames });
  clips.push({ id: id('clip'), kind, trackId, name: extra.name ?? name, startFrame, durationFrames, assetId: sha, trimBefore: 0, volume: 1, fit: 'contain', fadeIn: extra.fadeIn ?? 0, fadeOut: extra.fadeOut ?? 0 });
};
const component = (trackId, componentName, props, startFrame, durationFrames, extra = {}) => {
  clips.push({ id: id('clip'), kind: 'component', trackId, name: extra.name ?? componentName, startFrame, durationFrames: Math.max(1, durationFrames), componentName, props: core.resolveTemplateProps(componentName, props), ...(extra.animateIn ? { animateIn: extra.animateIn } : {}) });
};

let at = 0; // timeline position in frames
for (const section of episode.sections) {
  const recPath = join(out, 'rec', `${section.id}.json`);
  if (!existsSync(recPath)) {
    console.warn(`skipping ${section.id}: not recorded`);
    continue;
  }
  const rec = JSON.parse(readFileSync(recPath, 'utf8'));
  const length = f(rec.seconds);
  media('video', tracks.video.id, join(out, 'rec', `${section.id}.mp4`), at, length, { name: section.title, fadeIn: at === 0 ? 10 : 6, fadeOut: 6 });

  // Chapter marker for the first few seconds of each section after the opening.
  if (at > 0) component(tracks.brand.id, 'StepBadge', { step: episode.sections.indexOf(section), title: section.title, position: 'top-left', size: 30, color: ACCENT }, at + 6, f(3.2));

  const lineEnd = (k) => (k + 1 < rec.starts.length ? rec.starts[k + 1] : rec.seconds - 1.0);
  rec.starts.forEach((start, i) => {
    const line = tts[`${section.id}.${i}`];
    media('audio', tracks.vo.id, join(out, 'tts', line.file), at + f(start), Math.ceil(line.seconds * FPS), { name: line.say.slice(0, 48) });
  });

  for (const e of rec.events) {
    const start = at + f(e.t);
    if (e.kind === 'click') {
      component(tracks.clicks.id, 'ClickPulse', { x: Math.min(1, Math.max(0, e.x)), y: Math.min(1, Math.max(0, e.y)), color: ACCENT, size: 56 }, start, f(0.9));
      continue;
    }
    const until = e.seconds != null ? e.t + e.seconds : lineEnd(Math.min(e.line + (e.lines ?? 1) - 1, rec.starts.length - 1));
    const length = Math.max(f(1), f(until - e.t));
    if (e.dim) component(tracks.dim.id, 'SolidColor', { color: '#07080D', opacity: e.dim }, start, length, { animateIn: { type: 'fade', durationFrames: 8 } });
    const props = { ...e.props };
    for (const k of ['x', 'y', 'w', 'h']) if (typeof props[k] === 'number') props[k] = Math.min(1, Math.max(0, props[k]));
    if ('color' in (core.templateDefaults(e.component) ?? {}) && props.color == null) props.color = ACCENT;
    component(tracks.fx.id, e.component, props, start, length);
  }
  at += length;
}
// Branding goes on in Neon itself (see the episode README), so it is edited, not generated.

const project = core.ProjectSchema.parse({
  meta: { id: id('proj'), name: episode.title, fps: FPS, width: 1920, height: 1080, background: '#0B0D14', schemaVersion: core.PROJECT_SCHEMA_VERSION, createdAt: now, updatedAt: now, packs: [] },
  tracks: Object.values(tracks),
  clips,
  assets,
  transcripts: [],
});
writeFileSync(join(projectDir, 'project.json'), JSON.stringify(project, null, 2));
console.log(`${basename(projectDir)}: ${(at / FPS / 60).toFixed(2)} min, ${clips.length} clips, ${assets.length} assets`);
