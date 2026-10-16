# Vlog pipeline

Scripts for the byteMyFaceOff videos: pick projects, script an episode, record its demos,
voice it, and cut it in Neon Video Studio. Outputs go to git-ignored `out/` folders.

| Step | Script | Runs on |
|---|---|---|
| Rank all repos for video potential | `catalog.mjs` | old-mac |
| Voice every line, in Joe's cloned voice or Kokoro | `tts.mjs <episodeDir>` | old-mac, over ssh to Jellybingus or hasaki |
| Record each section's demo, timed to the voice | `record.mjs <episodeDir> [section…]` | Jellybingus desktop session |
| Check each line's footage | `sheets.mjs <episodeDir>` | Jellybingus |
| Build the Neon project | `assemble.mjs <episodeDir> <neonRepo> <project.neon>` | Jellybingus |

An episode is a folder under `episodes/` with an `episode.mjs`: sections of lines, each with
`say` (narration) and `do` (what the app does while it is said). Overlays come from the
elements the actions touch, so they land on the right spot. See
`episodes/git-gud-overview/` for a complete one, and the `video-script` skill for how to write
the script.

The voice is Joe's own, cloned with Chatterbox (see `voice/README.md`); he re-records only the
lines that come out wrong. Custom graphics live in the `fx/bytemyfaceoff` pack, and a line's
`zoom` pushes the camera in on an element; overlays move with it.

## Running on Jellybingus

Recording needs the logged-in desktop, which an ssh session does not have. The helper
`run-desktop.ps1` in `~/vlog/rec` starts `node` there through a one-off scheduled task.
`~/vlog/rec` holds `playwright-core`, a copy of these scripts and the episode folder.
Git Gud runs from its source checkout so `GITGUD_USER_DATA` keeps the recording profile
apart from Joe's real tabs and sign-ins. Encoding uses libx264: the box's Nvidia driver is
too old for ffmpeg's NVENC.

After `assemble.mjs`, open the project in the running Neon app and finish there with
`neon-cli` (branding, render), so the edit lives in the editor like any other.

## Graphics-only cuts

For an episode Joe voices himself, `graphics-cut.mjs <episodeDir> <neonRepo> <packDir> <outDir>`
builds a round-one project in its own headless Neon. The private `episode.json` holds one
section per beat (`title`, `say`, `show`, optional `notes`) and the `shots` under it
(`scene`, `title`, `items`, optional `image`). Each section becomes one script box in
review. Its shots are timed from the words at 150 a minute, plus 25 seconds per [JOE]
gap. The pack's first template is the background and its second is the stage, as in
`fx/neon-studio`. Every word on a shot is a field, so Joe edits all of it in the inspector.
