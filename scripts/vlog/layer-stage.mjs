// Put one StfuBackground clip under a StfuStage cut and give every stage clip an editable
// Items field. Labels are left out: add StfuLabels clips by hand where a shot wants them.
// Rerun after any retime. bun layer-stage.mjs <neonRepo> <host>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { stageProps } from './stfu-items.mjs';

const [neonPath, host] = process.argv.slice(2);
const cli = join(resolve(neonPath), 'apps/cli/src/main.ts');
const run = (...args) => {
  const result = JSON.parse(execFileSync(process.execPath, [cli, '--on', host, '--json', ...args], { encoding: 'utf8', maxBuffer: 32 << 20 }));
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result.data;
};
const dump = () => {
  const path = join(tmpdir(), 'layer-stage-state.json');
  run('state', 'dump', '--out', path);
  return JSON.parse(readFileSync(path, 'utf8'));
};

let project = dump();
const graphics = project.tracks.find(t => t.name === 'STFU graphics');
if (!graphics) throw new Error('No overlay track named STFU graphics.');
// Tracks paint in order, so the background must be an overlay lane below the graphics.
if (!project.tracks.some(t => t.name === 'STFU background')) {
  const free = project.tracks.find(t => t.kind === 'overlay' && t.order < graphics.order && !project.clips.some(c => c.trackId === t.id));
  if (!free) throw new Error('Need an empty overlay track below STFU graphics for the background.');
  run('tracks', 'update', free.id, '--name', 'STFU background');
  project = dump();
}
const background = project.tracks.find(t => t.name === 'STFU background');

const stages = project.clips.filter(c => c.componentName === 'StfuStage');
if (!stages.length) throw new Error('No StfuStage clips to layer.');
const end = Math.max(...project.clips.map(c => c.startFrame + c.durationFrames));
const old = project.clips.filter(c => c.componentName === 'StfuBackground');
const plan = [];
if (old.length) plan.push({ route: '/api/timeline/remove', body: { ids: old.map(c => c.id) } });
plan.push({ route: '/api/timeline/insert', body: { kind: 'component', componentName: 'StfuBackground', props: {}, at: 0, duration: end, trackId: background.id, name: 'Background', placement: 'overlap' } });
// Clips cut before the Items field carry subtitle and chapter instead; convert them once.
for (const stage of stages.filter(c => !('items' in c.props))) {
  plan.push({ route: '/api/timeline/update', body: { id: stage.id, patch: { props: stageProps(stage.props) } } });
}
const planPath = join(tmpdir(), 'layer-stage-plan.json');
writeFileSync(planPath, JSON.stringify(plan));
run('apply', planPath, '--dry-run');
run('history', 'checkpoint');
run('apply', planPath);
run('project', 'save');
console.log(`Background under ${(end / project.meta.fps).toFixed(1)} seconds. ${stages.length} stage clips with editable Items.`);
