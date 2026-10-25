// Build a round-one Neon project from an episode.json: one script box per section, marked for
// review, with a graphics cut under it timed from the words. No narration; Joe records that.
// bun graphics-cut.mjs <episodeDir> <neonRepo> <packDir> <outProjectDir>
// Runs its own headless Neon, so a project open in the app is never touched.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const [episodeArg, neonArg, packArg, outArg] = process.argv.slice(2);
const episodeDir = resolve(episodeArg);
const packDir = resolve(packArg);
const out = resolve(outArg);
if (existsSync(out)) throw new Error(`${out} exists. Pick a new folder so nothing is overwritten.`);
const episode = JSON.parse(readFileSync(join(episodeDir, 'episode.json'), 'utf8'));
const pack = JSON.parse(readFileSync(join(packDir, 'pack.json'), 'utf8'));
const [background, stage] = pack.templates.map(t => t.name);
const home = mkdtempSync(join(tmpdir(), 'neon-cut-'));
const cli = join(resolve(neonArg), 'apps/cli/src/main.ts');
// A private home must not inherit a different desktop or remote target.
const env = { ...process.env, NEON_HOME: home };
for (const key of ['NEON_HOST', 'NEON_ENDPOINT', 'NEON_TOKEN']) delete env[key];
const run = (...args) => {
  const result = JSON.parse(execFileSync(process.execPath, [cli, '--json', ...args], { encoding: 'utf8', maxBuffer: 64 << 20, env }));
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result.data;
};
const file = (name, data) => { const path = join(home, name); writeFileSync(path, JSON.stringify(data)); return path; };

// Spoken words at 150 a minute, plus time for each [JOE] gap Joe fills himself.
const seconds = say => {
  const gaps = say.match(/\[JOE:[\s\S]*?\]/g) ?? [];
  const words = say.replace(/\[JOE:[\s\S]*?\]/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(15, Math.round(words / 150 * 60 + gaps.length * 25));
};

const server = run('serve', '--detach');
const instance = JSON.parse(readFileSync(join(home, 'instance.json'), 'utf8'));
if (instance.pid !== server.pid || server.endpoint !== `http://127.0.0.1:${instance.port}` ||
    typeof instance.token !== 'string' || !instance.token) throw new Error('Private Neon instance does not match the server just started');
// Pin edits and shutdown to this exact server, even if discovery changes.
env.NEON_ENDPOINT = server.endpoint;
env.NEON_TOKEN = instance.token;
try {
  run('project', 'new', '--name', episode.title, '--fps', '30', '--width', '1920', '--height', '1080');
  run('packs', 'install', packDir);
  run('script', 'set', file('script.json', { sections: episode.sections.map(s => ({ title: s.title, status: 'review', lines: [{ say: s.say, show: s.show }] })) }));
  const bg = run('tracks', 'add', '--kind', 'overlay', '--name', `${pack.label} background`);
  const fg = run('tracks', 'add', '--kind', 'overlay', '--name', `${pack.label} graphics`);
  const fps = 30;
  const plan = [];
  let at = 0;
  for (const [i, section] of episode.sections.entries()) {
    const length = seconds(section.say) * fps;
    const each = Math.floor(length / section.shots.length);
    const chapter = `${String(i + 1).padStart(2, '0')} / ${section.title}`;
    for (const [j, shot] of section.shots.entries()) {
      const image = shot.image ? `data:image/png;base64,${readFileSync(join(episodeDir, shot.image)).toString('base64')}` : '';
      const duration = j === section.shots.length - 1 ? length - each * j : each;
      plan.push({ route: '/api/timeline/insert', body: { kind: 'component', componentName: stage, props: { scene: shot.scene, chapter, title: shot.title, items: shot.items, image }, at, duration, trackId: fg.id, name: `${section.title} / ${shot.title}`, placement: 'overlap' } });
      at += duration;
    }
  }
  plan.unshift({ route: '/api/timeline/insert', body: { kind: 'component', componentName: background, props: {}, at: 0, duration: at, trackId: bg.id, name: 'Background', placement: 'overlap' } });
  const planPath = file('plan.json', plan);
  run('apply', planPath, '--dry-run');
  run('apply', planPath);
  for (const [i, section] of episode.sections.entries()) for (const note of section.notes ?? []) run('notes', 'add', String(i + 1), note);
  run('project', 'save', out);
  console.log(`${basename(out)}: ${episode.sections.length} sections in review, ${plan.length} clips, ${Math.round(at / fps / 6) / 10} minutes of graphics.`);
} finally {
  run('stop');
}
