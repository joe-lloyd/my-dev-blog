// Record an episode's screen demos, one video per section, timed to its voiceover.
//
// Runs on the Windows box in the logged-in desktop session (see run-desktop.ps1), with
// playwright-core installed next to it. Usage:
//   node record.mjs <episodeDir> [sectionId ...]
//
// Reads <episodeDir>/out/tts.json for line lengths. Each line's action starts when its
// voiceover line does; the actual start times, overlay events and clicks are written to
// out/rec/<section>.json, and the picture to out/rec/<section>.mp4.
import { _electron as electron } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const GAP = 0.45; // seconds of silence after each voiceover line
const LEAD = 0.8; // seconds of picture before the first line
const TAIL = 1.2; // seconds after the last line

const [episodeDir, ...only] = process.argv.slice(2).map((a, i) => (i === 0 ? resolve(a) : a));
const episode = (await import(pathToFileURL(join(episodeDir, 'episode.mjs')).href)).default;
const tts = JSON.parse(readFileSync(join(episodeDir, 'out', 'tts.json'), 'utf8'));
const outDir = join(episodeDir, 'out', 'rec');
mkdirSync(outDir, { recursive: true });
const log = (...a) => { console.log(...a); writeFileSync(join(outDir, 'record.log'), a.join(' ') + '\n', { flag: 'a' }); };

async function launch(app) {
  const profile = join(outDir, 'profile');
  rmSync(profile, { recursive: true, force: true });
  const electronApp = await electron.launch({
    executablePath: join(app.dir, 'node_modules', 'electron', 'dist', 'electron.exe'),
    args: [app.dir],
    cwd: app.dir,
    env: { ...process.env, ...app.env(profile), ELECTRON_RENDERER_URL: '' },
    timeout: 60000,
  });
  const win = await electronApp.firstWindow();
  await win.waitForLoadState('domcontentloaded');
  await electronApp.evaluate(({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    w.setContentSize(1920, 1080);
    w.center();
    w.focus();
  });
  await win.waitForTimeout(1500);
  return { electronApp, win };
}

async function recordSection(section) {
  log('section', section.id);
  if (section.prepare) section.prepare(episode.context);
  const { electronApp, win } = await launch(episode.app);
  const viewport = await win.evaluate(() => [innerWidth, innerHeight]);
  const events = [];
  let t0 = 0;
  let line = -1;
  const now = () => (Date.now() - t0) / 1000;
  const box = async (loc) => {
    const b = await loc.boundingBox();
    if (!b) throw new Error('no bounding box for ' + loc);
    return { x: b.x / viewport[0], y: b.y / viewport[1], w: b.width / viewport[0], h: b.height / viewport[1] };
  };
  const ctx = {
    app: electronApp,
    win,
    context: episode.context,
    wait: (ms) => win.waitForTimeout(ms),
    box,
    /** An overlay from the episode's FX packs; lasts to the end of the current line unless `lines` or `seconds` says otherwise. */
    fx: (component, props, opts = {}) => events.push({ kind: 'fx', t: now(), line, component, props, ...opts }),
    async click(loc, opts = {}) {
      const b = await box(loc);
      events.push({ kind: 'click', t: now(), x: b.x + b.w / 2, y: b.y + b.h / 2 });
      await loc.click(opts);
    },
    async callout(loc, text, opts = {}) {
      const b = await box(loc);
      const { at = 'center', ...rest } = opts;
      const x = at === 'left' ? b.x + 0.004 : b.x + b.w / 2;
      ctx.fx('Callout', { text, x, y: b.y + b.h / 2 }, rest);
    },
    async highlight(loc, label = '', opts = {}) {
      const b = await box(loc);
      ctx.fx('HighlightBox', { x: b.x, y: b.y, w: b.w, h: b.h, label }, opts);
    },
    async spotlight(loc, opts = {}) {
      const b = await box(loc);
      const pad = 0.006;
      ctx.fx('Spotlight', { x: b.x - pad, y: b.y - pad, w: b.w + 2 * pad, h: b.h + 2 * pad }, opts);
    },
    /**
     * Seconds from the current line's start until `phrase` is spoken in line `line + offset`,
     * assuming an even pace within a line. For syncing reveals inside a full-frame graphic.
     */
    when(offset, phrase) {
      let t = 0;
      for (let k = line; k < line + offset; k++) t += tts[`${section.id}.${k}`].seconds + GAP;
      const say = section.lines[line + offset].say;
      const idx = say.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx < 0) throw new Error(`"${phrase}" is not in line ${line + offset}`);
      const before = say.slice(0, idx).split(/\s+/).filter(Boolean).length;
      const words = say.split(/\s+/).filter(Boolean).length;
      return Math.round((t + (before / words) * tts[`${section.id}.${line + offset}`].seconds) * 10) / 10;
    },
    /** Push the camera in on an element; holds to the end of the line unless `lines` or `seconds` says otherwise. */
    async zoom(loc, opts = {}) {
      const b = await box(loc);
      const { zoom = 1.7, ...rest } = opts;
      events.push({ kind: 'zoom', t: now(), line, cx: b.x + b.w / 2, cy: b.y + b.h / 2, zoom, ...rest });
    },
    async key(combo, label = '') {
      ctx.fx('KeyCombo', { combo, label, platform: 'pc' }, { seconds: 2.2 });
      await win.keyboard.press(combo.replace('Ctrl', 'Control'));
    },
    /**
     * Smooth wheel scroll at a point: `dy` pixels over `ms`, timed by the clock. Each wheel event
     * is a round trip to the app, so a fixed step count stretched a 5 s scroll to 20 s of dead air;
     * here each step covers whatever time actually passed.
     */
    async scroll(x, y, dy, ms) {
      await win.mouse.move(x * viewport[0], y * viewport[1]);
      const started = Date.now();
      let done = 0;
      while (done < 1) {
        const target = Math.min(1, (Date.now() - started) / ms);
        if (target > done) await win.mouse.wheel(0, dy * (target - done));
        done = target;
        await win.waitForTimeout(16);
      }
    },
  };

  for (const repo of section.open ?? []) await episode.openRepo(ctx, repo);
  if (section.setup) await section.setup(ctx);
  await win.waitForTimeout(800);

  const frameDir = join(outDir, section.id);
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });
  const cdp = await electronApp.context().newCDPSession(win);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = `f${String(frames.length).padStart(6, '0')}.jpg`;
    frames.push({ file, t: metadata.timestamp });
    writeFileSync(join(frameDir, file), Buffer.from(data, 'base64'));
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const wallStart = Date.now() / 1000;
  t0 = Date.now();

  const starts = [];
  let planned = LEAD;
  for (let i = 0; i < section.lines.length; i++) {
    const seconds = tts[`${section.id}.${i}`]?.seconds;
    if (seconds == null) throw new Error(`no voiceover for ${section.id}.${i}; run tts.mjs first`);
    const wait = planned - now();
    if (wait > 0) await win.waitForTimeout(wait * 1000);
    line = i;
    const start = now();
    starts.push(start);
    planned = start + seconds + GAP;
    const action = section.lines[i].do;
    if (action) {
      try {
        await action(ctx);
      } catch (e) {
        log('  line', i, 'failed:', e.message.split('\n')[0]);
      }
    }
    const { zoom } = section.lines[i];
    if (zoom) {
      try {
        await ctx.zoom(zoom.on(ctx), zoom);
      } catch (e) {
        log('  line', i, 'zoom failed:', e.message.split('\n')[0]);
      }
    }
  }
  const end = Math.max(planned, now()) + TAIL;
  await win.waitForTimeout(Math.max(0, end - now()) * 1000);
  await cdp.send('Page.stopScreencast');
  await win.waitForTimeout(300);
  await electronApp.close();

  // Screencast frames arrive only when the picture changes; each one holds until the next.
  const list = frames.map((f, i) => {
    const from = i === 0 ? wallStart : f.t;
    const to = i + 1 < frames.length ? frames[i + 1].t : wallStart + end;
    return `file '${f.file}'\nduration ${Math.max(0.001, to - from).toFixed(4)}`;
  });
  list.push(`file '${frames.at(-1).file}'`);
  writeFileSync(join(frameDir, 'frames.txt'), list.join('\n') + '\n');
  const mp4 = join(outDir, `${section.id}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(frameDir, 'frames.txt'),
    '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0d14,fps=30,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-t', end.toFixed(3), mp4]);
  writeFileSync(join(outDir, `${section.id}.json`), JSON.stringify({ id: section.id, seconds: end, viewport, starts, events, frames: frames.length }, null, 1));
  log('  done', end.toFixed(1) + 's', frames.length, 'frames');
}

for (const section of episode.sections) {
  if (section.footage === false) continue;
  if (only.length && !only.includes(section.id)) continue;
  try {
    await recordSection(section);
  } catch (e) {
    log('section', section.id, 'FAILED', e.stack);
  }
}
log('finished');
