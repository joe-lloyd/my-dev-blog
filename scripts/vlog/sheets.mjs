// Contact sheet per recorded section: one frame 2 s into each voiceover line, in order.
// Usage: node sheets.mjs <episodeDir> [sectionId ...]   -> out/rec/<id>-lines.jpg
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [dir, ...only] = process.argv.slice(2);
const rec = join(resolve(dir), 'out', 'rec');
for (const file of readFileSync(join(rec, 'record.log'), 'utf8').matchAll(/^section (\S+)$/gm)) {
  const id = file[1];
  if ((only.length && !only.includes(id)) || !existsSync(join(rec, `${id}.json`))) continue;
  const { starts } = JSON.parse(readFileSync(join(rec, `${id}.json`), 'utf8'));
  const picks = starts.map((s) => `lt(prev_pts*TB\\,${(s + 2).toFixed(2)})*gte(pts*TB\\,${(s + 2).toFixed(2)})`).join('+');
  const cols = 4, rows = Math.ceil(starts.length / cols);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(rec, `${id}.mp4`), '-vf', `select='${picks}',scale=640:-1,tile=${cols}x${rows}`, '-frames:v', '1', '-fps_mode', 'vfr', join(rec, `${id}-lines.jpg`)]);
  console.log(id, starts.length, 'lines');
}
