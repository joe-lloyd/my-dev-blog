// Voice every line of an episode with Kokoro on hasaki's speaches server (loopback only,
// so it goes over ssh). Usage: node tts.mjs <episodeDir>
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

const SPEED = 0.94;
const manifest = {};
let total = 0;
for (const section of episode.sections) {
  for (const [i, line] of section.lines.entries()) {
    const key = `${section.id}.${i}`;
    const text = spoken(line.say);
    const hash = createHash('sha256').update(`${episode.voice}\0${SPEED}\0${text}`).digest('hex').slice(0, 16);
    const file = `${key}.wav`;
    if (old[key]?.hash !== hash || !existsSync(join(outDir, file))) {
      const body = JSON.stringify({ model: 'speaches-ai/Kokoro-82M-v1.0-ONNX', voice: episode.voice, input: text, response_format: 'wav', speed: SPEED });
      const wav = execFileSync('ssh', ['hasaki', "curl -sf -X POST 127.0.0.1:8010/v1/audio/speech -H 'content-type: application/json' --data-binary @-"], { input: body, maxBuffer: 64 << 20 });
      writeFileSync(join(outDir, file), wav);
      process.stdout.write('.');
    }
    const seconds = wavSeconds(readFileSync(join(outDir, file)));
    manifest[key] = { file, hash, seconds: Math.round(seconds * 1000) / 1000, say: line.say };
    total += seconds;
  }
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
const words = episode.sections.flatMap((s) => s.lines).reduce((n, l) => n + l.say.split(/\s+/).length, 0);
console.log(`\n${Object.keys(manifest).length} lines, ${words} words, ${(total / 60).toFixed(1)} min of speech`);
