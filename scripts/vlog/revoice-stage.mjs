// Replace a narrated StfuStage cut through Neon's API, retaining graphics and script edits.
// bun revoice-stage.mjs <episodeDir> <neonRepo> <host> <remoteEpisodeDir>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [dir, repo, host, remote] = process.argv.slice(2);
const root = resolve(dir);
const run = (...args) => {
  const r = JSON.parse(
    execFileSync(
      process.execPath,
      [join(resolve(repo), 'apps/cli/src/main.ts'), '--on', host, '--json', ...args],
      { encoding: 'utf8', maxBuffer: 32 << 20 }
    )
  );
  if (!r.ok) throw Error(JSON.stringify(r));
  return r.data;
};
const episode = (await import(pathToFileURL(join(root, 'episode.mjs')))).default;
const tts = JSON.parse(readFileSync(join(root, 'out/tts.json')));
const old = JSON.parse(readFileSync(join(root, 'placements.json')));
const before = join(root, 'before-revoice.json');
run('state', 'dump', '--out', before);
const p = JSON.parse(readFileSync(before));
if (p.script.sections.length !== episode.sections.length) throw Error('Section count changed');
if (p.script.notes.some(n => n.on.kind === 'frame')) throw Error('Frame notes need manual retiming');
const graphics = p.clips.filter(c => c.componentName === 'StfuStage').sort((a, b) => a.startFrame - b.startFrame);
const audio = p.clips.filter(c => c.kind === 'audio').sort((a, b) => a.startFrame - b.startFrame);
if (graphics.length !== old.placements.length || audio.length !== graphics.length)
  throw Error('Unexpected cut layout');
const plan = [];
const push = (route, body) => {
  let n = plan.length;
  plan.push({ route, body });
  return n;
};
push('/api/timeline/remove', { ids: audio.map(c => c.id) });
const fps = p.meta.fps,
  lead = Math.round(fps * 0.35);
let at = 0,
  index = 0;
const placements = [],
  chapters = [],
  scriptOps = [],
  captions = [];
const tc = f => {
  const ms = Math.round((f / fps) * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(
    2,
    '0'
  )}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
for (const [s, section] of episode.sections.entries()) {
  const start = at;
  chapters.push({ title: section.title, startFrame: at });
  for (const [i, line] of section.lines.entries()) {
    const key = `${section.id}.${i}`,
      speech = tts[key],
      shot = graphics[index],
      previous = old.placements[index];
    if (
      previous.section !== section.id ||
      previous.line !== i ||
      shot.startFrame !== previous.startFrame ||
      shot.componentName !== 'StfuStage'
    )
      throw Error(`Cut changed at ${key}`);
    if (!speech || !Number.isFinite(speech.seconds) || speech.seconds <= 0)
      throw Error(`Missing voice ${key}`);
    const frames = Math.ceil(speech.seconds * fps),
      duration = frames + lead + Math.round(fps * (section.id === 'outro' ? 1 : 0.8));
    const asset = push('/api/assets/import', {
      path: `${remote}/out/tts/${speech.file}`,
    });
    push('/api/timeline/insert', {
      kind: 'audio',
      assetId: `$${asset}.asset.id`,
      at: at + lead,
      duration: frames,
      trackId: audio[index].trackId,
      name: `${section.title} / ${i + 1} · revised voice`,
      placement: 'overlap',
    });
    push('/api/timeline/update', {
      id: shot.id,
      patch: { startFrame: at, durationFrames: duration },
    });
    placements.push({ ...previous, startFrame: at, durationFrames: duration });
    captions.push(`${captions.length + 1}\n${tc(at + lead)} --> ${tc(at + lead + frames)}\n${line.say}\n`);
    at += duration;
    index++;
  }
  const original = p.script.sections[s].lines;
  if (original.length !== 1) throw Error('Expected one editable box per section');
  scriptOps.push({
    op: 'line.update',
    id: original[0].id,
    at: start,
    duration: at - start,
  });
}
push('/api/script/edit', { ops: scriptOps });
const file = join(root, 'revoice-plan.json');
writeFileSync(file, JSON.stringify(plan));
run('apply', file, '--dry-run');
run('history', 'checkpoint');
run('apply', file);
run('project', 'save');
writeFileSync(join(root, 'placements-before-revoice.json'), JSON.stringify(old, null, 2));
writeFileSync(
  join(root, 'placements.json'),
  JSON.stringify({ fps, durationFrames: at, chapters, placements }, null, 2)
);
writeFileSync(join(root, 'draft-captions.srt'), captions.join('\n'));
console.log(`${index} revised voice clips; ${at / fps}s; graphic properties and script words retained`);
