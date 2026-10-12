// Voice every line of an episode: Kokoro on hasaki's speaches server (loopback only, so
// over ssh), or Joe's cloned voice with Chatterbox on Jellybingus. Usage: node tts.mjs <episodeDir>
// Writes out/tts/<section>.<line>.wav and out/tts.json with each line's length. Lines
// whose text has not changed are reused.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const episodeDir = resolve(process.argv[2]);
const episode = (await import(pathToFileURL(join(episodeDir, 'episode.mjs')).href)).default;
const outDir = join(episodeDir, 'out', 'tts');
mkdirSync(outDir, { recursive: true });
const manifestPath = join(episodeDir, 'out', 'tts.json');
const old = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

// Spellings Kokoro reads better than the written form.
const SPOKEN = [[/\brerere\b/g, 'ree-ree-ree'], [/\bWip\b/g, 'Whip'], [/\bwip\b/g, 'whip'], [/\bGit Gud\b/g, 'Git Gudd']];
const SPEED = 0.94; // Kokoro only
const spoken = (text) => SPOKEN.reduce((t, [re, to]) => t.replace(re, to), text);

function wavSeconds(buf) {
  const rate = buf.readUInt32LE(24), channels = buf.readUInt16LE(22), bits = buf.readUInt16LE(34);
  let off = 12;
  while (off < buf.length - 8) {
    const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === 'data') return (Math.min(size, buf.length - off - 8)) / (rate * channels * bits / 8);
    off += 8 + size;
  }
  throw new Error('no data chunk');
}

const manifest = {};
const voice = typeof episode.voice === 'string' ? { engine: 'kokoro', name: episode.voice } : episode.voice;
const todo = [];
for (const section of episode.sections) {
  for (const [i, line] of section.lines.entries()) {
    const key = `${section.id}.${i}`;
    const text = spoken(line.say);
    const hash = createHash('sha256').update(`${JSON.stringify(voice)}\0${SPEED}\0${text}`).digest('hex').slice(0, 16);
    const file = `${key}.wav`;
    manifest[key] = { file, hash, say: line.say };
    if (old[key]?.hash !== hash || !existsSync(join(outDir, file))) todo.push({ key, file, hash, text });
  }
}

if (voice.engine === 'kokoro') {
  for (const job of todo) {
    const body = JSON.stringify({ model: 'speaches-ai/Kokoro-82M-v1.0-ONNX', voice: voice.name, input: job.text, response_format: 'wav', speed: SPEED });
    writeFileSync(join(outDir, job.file), execFileSync('ssh', ['hasaki', "curl -sf -X POST 127.0.0.1:8010/v1/audio/speech -H 'content-type: application/json' --data-binary @-"], { input: body, maxBuffer: 64 << 20 }));
    process.stdout.write('.');
  }
} else if (voice.engine === 'chatterbox' && todo.length) {
  // Cloned voice on Jellybingus's GPU: voice/clone.py in a one-off container from an image
  // that has chatterbox-tts. The reference clip stays on that box (voice/README.md).
  const remote = 'vlog/voice';
  const jobs = { ref: `refs/${voice.ref}.wav`, cfg_weight: voice.cfg, exaggeration: voice.exaggeration ?? 0.5, lines: todo.map((j) => ({ text: j.text, out: `cache/${j.hash}.wav` })) };
  writeFileSync(join(outDir, 'jobs.json'), JSON.stringify(jobs));
  execFileSync('scp', ['-q', join(outDir, 'jobs.json'), join(import.meta.dirname, 'voice', 'clone.py'), `jellybingus:${remote}/`]);
  execFileSync('ssh', ['jellybingus', `docker run --rm --gpus all --entrypoint python -e HF_HOME=/hf -v C:/Users/joell/.cache/huggingface:/hf -v C:/Users/joell/${remote}:/work -w /work ${voice.image} clone.py jobs.json`], { stdio: ['ignore', 'inherit', 'ignore'], maxBuffer: 64 << 20 });
  for (const job of todo) execFileSync('scp', ['-q', `jellybingus:${remote}/cache/${job.hash}.wav`, join(outDir, job.file)]);
}

let total = 0;
for (const entry of Object.values(manifest)) {
  entry.seconds = Math.round(wavSeconds(readFileSync(join(outDir, entry.file))) * 1000) / 1000;
  total += entry.seconds;
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
const words = episode.sections.flatMap((s) => s.lines).reduce((n, l) => n + l.say.split(/\s+/).length, 0);
console.log(`\n${Object.keys(manifest).length} lines, ${words} words, ${(total / 60).toFixed(1)} min of speech`);
