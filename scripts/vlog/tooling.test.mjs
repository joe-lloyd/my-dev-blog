// Run with Bun, the runtime used by the Neon CLI: bun scripts/vlog/tooling.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scripts = fileURLToPath(new URL('.', import.meta.url));
const root = mkdtempSync(join(tmpdir(), 'vlog-tooling-test-'));
const repo = join(root, 'neon');
const log = join(root, 'calls.jsonl');
const stateFile = join(root, 'state.json');
mkdirSync(join(repo, 'apps/cli/src'), { recursive: true });
writeFileSync(join(repo, 'apps/cli/src/main.ts'), `
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const args = process.argv.slice(2);
if (args[0] === '--on') args.splice(0, 2);
if (args[0] === '--json') args.shift();
appendFileSync(process.env.FIXTURE_LOG, JSON.stringify({ args,
  host: process.env.NEON_HOST, endpoint: process.env.NEON_ENDPOINT, token: process.env.NEON_TOKEN }) + '\\n');
let data = {};
if (args[0] === 'serve') {
  data = { pid: 123, port: 12345, endpoint: 'http://127.0.0.1:12345' };
  writeFileSync(join(process.env.NEON_HOME, 'instance.json'), JSON.stringify({ pid: 123, port: 12345, token: 'isolated-fixture' }));
}
if (args[0] === 'state') writeFileSync(args[args.indexOf('--out') + 1], readFileSync(process.env.FIXTURE_STATE));
if (args[0] === 'tracks') data = { id: 'fixture-track' };
console.log(JSON.stringify({ ok: true, data }));
`);
const env = { ...process.env, FIXTURE_LOG: log, FIXTURE_STATE: stateFile };
const run = (script, args, overrides = {}) => {
  writeFileSync(log, '');
  const result = spawnSync(process.execPath, [join(scripts, script), ...args], {
    encoding: 'utf8', env: { ...env, ...overrides },
  });
  const calls = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  return { result, calls };
};
try {
  const episode = join(root, 'episode');
  mkdirSync(join(episode, 'out'), { recursive: true });
  const placements = [0, 1].map(line => ({ section: 'intro', line, startFrame: line * 100, durationFrames: 100 }));
  const state = {
    meta: { fps: 30 },
    script: { sections: [{ lines: [{ id: 'script-line', say: 'Human edits' }] }], notes: [] },
    clips: placements.flatMap((p, i) => [
      { id: `g${i}`, componentName: 'StfuStage', kind: 'component', startFrame: p.startFrame, props: { title: 'Human title' } },
      { id: `a${i}`, kind: 'audio', trackId: 'voice', startFrame: p.startFrame + 11 },
    ]),
  };
  writeFileSync(stateFile, JSON.stringify(state));
  const prepare = lines => {
    writeFileSync(join(episode, 'episode.mjs'), 'export default ' + JSON.stringify({ sections: [{ id: 'intro', title: 'Intro', lines }] }));
    writeFileSync(join(episode, 'placements.json'), JSON.stringify({ placements }));
    writeFileSync(join(episode, 'out/tts.json'), JSON.stringify(Object.fromEntries(placements.map(p => [`intro.${p.line}`, { file: `${p.line}.wav`, seconds: 2 }]))));
  };
  prepare([{ say: 'One' }]);
  const shortened = run('revoice-stage.mjs', [episode, repo, 'fixture-host', '/episode']);
  assert.notEqual(shortened.result.status, 0);
  assert.match(shortened.result.stderr, /Episode lines must match every existing placement/);
  assert(!shortened.calls.some(c => ['apply', 'history', 'project'].includes(c.args[0])));
  assert.deepEqual(JSON.parse(readFileSync(join(episode, 'placements.json'), 'utf8')).placements, placements);
  prepare([{ say: 'One' }, { say: 'Two' }]);
  const unchanged = run('revoice-stage.mjs', [episode, repo, 'fixture-host', '/episode']);
  assert.equal(unchanged.result.status, 0, unchanged.result.stderr);
  const plan = JSON.parse(readFileSync(join(episode, 'revoice-plan.json'), 'utf8'));
  assert.equal(plan.filter(op => op.route === '/api/timeline/insert').length, 2);
  for (const op of plan.filter(op => op.route === '/api/timeline/update')) {
    assert.deepEqual(Object.keys(op.body.patch).sort(), ['durationFrames', 'startFrame']);
  }
  const graphicEpisode = join(root, 'graphics');
  mkdirSync(graphicEpisode);
  writeFileSync(join(graphicEpisode, 'episode.json'), JSON.stringify({ title: 'Fixture', sections: [
    { title: 'Intro', say: 'Example', show: 'Graphics', shots: [{ scene: 'title', title: 'Example', items: '' }] },
  ] }));
  const graphics = run('graphics-cut.mjs', [graphicEpisode, repo, join(scripts, 'fx/neon-studio'), join(root, 'output')], {
    NEON_HOST: 'wrong-host', NEON_ENDPOINT: 'http://127.0.0.1:1', NEON_TOKEN: 'wrong-fixture-token',
  });
  assert.equal(graphics.result.status, 0, graphics.result.stderr);
  assert.equal(graphics.calls[0].args[0], 'serve');
  assert.equal(graphics.calls[0].host, undefined);
  assert.equal(graphics.calls[0].endpoint, undefined);
  assert.equal(graphics.calls[0].token, undefined);
  for (const call of graphics.calls.slice(1)) {
    assert.equal(call.host, undefined);
    assert.equal(call.endpoint, 'http://127.0.0.1:12345');
    assert.equal(call.token, 'isolated-fixture');
  }
  assert.equal(graphics.calls.at(-1).args[0], 'stop');
  console.log('PASS: shortened cuts abort before mutation; unchanged cuts retain graphic props; graphics edits and shutdown stay on the private instance.');
} finally {
  rmSync(root, { recursive: true, force: true });
}
