// Pulls stills for a blog post out of a published video, using the Neon Video Studio project the
// video was rendered from.
//
//   node scripts/video-stills.mjs <out-dir> <project.neon> <youtube-url> [<project.neon> <youtube-url>...]
//
// The project (<project.neon>/project.json) says when every diagram, card and callout is on
// screen. The script downloads the video at 1080p and grabs a frame at each of those moments: a
// diagram or card once it has fully built, a callout while its label shows on the footage. A script
// section with neither gets one frame of its footage. It writes the frames and a manifest.json
// that names each frame's section, kind and caption, so a person picks which ones go in the post.
//
// Needs Neon Video Studio's bundled tools: ~/.neon-video/tools/ffmpeg and yt-dlp.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { basename, join } from "node:path"

const TOOLS = join(homedir(), ".neon-video", "tools")
const [out, ...pairs] = process.argv.slice(2)
if (!out || pairs.length === 0 || pairs.length % 2) {
  throw new Error("usage: video-stills.mjs <out-dir> <project.neon> <youtube-url> [...]")
}
const cache = join(out, "videos")
mkdirSync(cache, { recursive: true })

// Diagrams and cards are named per series (GitGudDiagram, HtmlifyDiagram, ...).
const isGraphic = (name = "") => /(Diagram|Card)$/.test(name)

const manifestFile = join(out, "manifest.json")
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : []
for (let i = 0; i < pairs.length; i += 2) {
  const [dir, url] = [pairs[i], pairs[i + 1]]
  const id = basename(dir).replace(/\.neon$/, "")
  const project = JSON.parse(readFileSync(join(dir, "project.json"), "utf8"))
  const fps = project.meta.fps
  const video = join(cache, `${id}.mp4`)
  if (!existsSync(video)) {
    execFileSync(join(TOOLS, "yt-dlp"), ["-q", "-f", "bv[height=1080][ext=mp4]", "-o", video, url], { stdio: "inherit" })
  }
  // A video that doesn't match its project would put every frame at the wrong moment.
  const length = Number(execFileSync(join(TOOLS, "ffprobe"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString())
  const timeline = Math.max(...project.clips.map((c) => c.startFrame + c.durationFrames)) / fps
  if (Math.abs(length - timeline) > 0.5) throw new Error(`${id}: video is ${length}s but the project is ${timeline}s`)

  // A section runs from its first placed line to the next section's first line.
  const sections = project.script.sections.filter((s) => s.lines.some((l) => l.placed))
  const starts = sections.map((s) => Math.min(...s.lines.filter((l) => l.placed).map((l) => l.placed.startFrame)))
  const sectionAt = (frame) => sections[starts.findLastIndex((start) => start <= frame)]?.title ?? ""

  for (const m of manifest.filter((m) => m.episode === id)) manifest.splice(manifest.indexOf(m), 1)
  const grab = (frame, kind, caption, props) => {
    const file = `${id}-${String(manifest.filter((m) => m.episode === id).length + 1).padStart(2, "0")}.jpg`
    execFileSync(join(TOOLS, "ffmpeg"), ["-y", "-loglevel", "error", "-ss", (frame / fps).toFixed(2), "-i", video, "-frames:v", "1", "-q:v", "2", join(out, file)])
    manifest.push({ episode: id, section: sectionAt(Math.round(frame)), kind, caption, props, file })
  }

  const seen = new Set()
  for (const clip of project.clips) {
    let frame
    if (isGraphic(clip.componentName)) frame = clip.startFrame + clip.durationFrames * 0.85
    else if (clip.componentName === "Callout") frame = clip.startFrame + clip.durationFrames * 0.6
    else continue
    const key = JSON.stringify([clip.componentName, clip.props])
    if (seen.has(key)) continue
    seen.add(key)
    grab(frame, clip.componentName, String(clip.props.text ?? clip.props.title ?? clip.props.caption ?? ""), clip.props)
  }

  // A section with no diagram or callout still gets one frame of its footage, half a second
  // before its last line ends, when the actions it narrates have played out.
  for (const section of sections) {
    if (manifest.some((m) => m.episode === id && m.section === section.title)) continue
    const end = Math.max(...section.lines.filter((l) => l.placed).map((l) => l.placed.startFrame + l.placed.durationFrames))
    grab(end - fps / 2, "Footage", section.title, {})
  }
  process.stdout.write(`${id}: ${manifest.filter((m) => m.episode === id).length} stills\n`)
}
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2))
