// Cut narrated graphics into the running Neon project, keeping its script sections and notes.
// bun stage-cut.mjs <episodeDir> <neonRepo> <host> <remoteEpisodeDir>
// Episode lines supply say, scene, title, subtitle, and optionally image, a local PNG path.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [episodePath, neonPath, host, remoteDir] = process.argv.slice(2);
const episodeDir = resolve(episodePath);
const cli = join(resolve(neonPath), 'apps/cli/src/main.ts');
const run = (...args) => {
  const result = JSON.parse(execFileSync(process.execPath, [cli, '--on', host, '--json', ...args], { encoding: 'utf8', maxBuffer: 32 << 20 }));
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result.data;
};
const episode = (await import(pathToFileURL(join(episodeDir, 'episode.mjs')).href)).default;
const tts = JSON.parse(readFileSync(join(episodeDir, 'out/tts.json'), 'utf8'));
const statePath = join(episodeDir, 'before-cut.json');
run('state', 'dump', '--out', statePath);
const project = JSON.parse(readFileSync(statePath, 'utf8'));
if (project.script.sections.length !== episode.sections.length) throw new Error('Episode sections must match the open project.');
if (project.clips.some(c => c.name !== 'STFU stage')) throw new Error('The project already has a cut. Open the script-only project to assemble.');
run('history', 'checkpoint');
const graphics = project.tracks.find(t => t.name === 'STFU graphics');
if (!graphics) throw new Error('Add an overlay track named STFU graphics first.');
const vo = project.tracks.find(t => t.name === 'Draft narration') ?? run('tracks', 'add', '--kind', 'audio', '--name', 'Draft narration');
const fps = project.meta.fps;
const plan = [];
const push = (route, body) => { const index = plan.length; plan.push({ route, body }); return index; };
if (project.clips.length) push('/api/timeline/remove', { ids: project.clips.map(c => c.id) });
let at = 0;
const placements = [];
const chapters = [];
const scriptOps = [];
const captions = [];
const timecode = frame => {
  const ms = Math.round(frame / fps * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
for (const [s, section] of episode.sections.entries()) {
  const sectionStart = at;
  chapters.push({ title: section.title, startFrame: at });
  for (const [i, line] of section.lines.entries()) {
    const speech = tts[`${section.id}.${i}`];
    if (!speech || !Number.isFinite(speech.seconds) || speech.seconds <= 0) throw new Error(`Missing speech: ${section.id}.${i}`);
    const voiceFrames = Math.ceil(speech.seconds * fps);
    const lead = Math.round(fps * 0.35);
    const duration = voiceFrames + lead + Math.round(fps * (section.id === 'outro' ? 1 : 0.8));
    const imported = push('/api/assets/import', { path: `${remoteDir}/out/tts/${speech.file}` });
    push('/api/timeline/insert', { kind: 'audio', assetId: `$${imported}.asset.id`, at: at + lead, duration: voiceFrames, trackId: vo.id, name: `${section.title} / ${i + 1} · temporary voice`, placement: 'overlap' });
    const props = { scene: line.scene, title: line.title, subtitle: line.subtitle, chapter: `${String(s + 1).padStart(2, '0')} / ${section.title}`, image: line.image ? `data:image/png;base64,${readFileSync(join(episodeDir, line.image)).toString('base64')}` : '' };
    push('/api/timeline/insert', { kind: 'component', componentName: 'StfuStage', props, at, duration, trackId: graphics.id, name: `${section.title} / ${line.title}`, placement: 'overlap' });
    placements.push({ section: section.id, line: i, startFrame: at, durationFrames: duration, say: line.say, scene: line.scene });
    captions.push(`${captions.length + 1}\n${timecode(at + lead)} --> ${timecode(at + lead + voiceFrames)}\n${line.say}\n`);
    at += duration;
  }
  const original = project.script.sections[s].lines[0];
  if (!original) throw new Error(`No editable box in section ${s + 1}`);
  const questions = original.say.match(/\[JOE:[\s\S]*?\]/g) ?? [];
  scriptOps.push({ op: 'line.update', id: original.id, say: [...section.lines.map(l => l.say), ...questions].join('\n\n'), show: section.lines.map(l => l.show).join('\n'), at: sectionStart, duration: at - sectionStart });
}
push('/api/script/edit', { ops: scriptOps });
const planPath = join(episodeDir, 'cut-plan.json');
writeFileSync(planPath, JSON.stringify(plan));
writeFileSync(join(episodeDir, 'placements.json'), JSON.stringify({ fps, durationFrames: at, chapters, placements }, null, 2));
writeFileSync(join(episodeDir, 'draft-captions.srt'), captions.join('\n'));
run('apply', planPath, '--dry-run');
run('apply', planPath);
run('project', 'save');
console.log(`${placements.length} shots, ${(at / fps).toFixed(1)} seconds. Seven editable boxes and existing notes retained.`);
