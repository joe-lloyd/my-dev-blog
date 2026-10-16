# Neon Studio pack

Full-frame graphics for the Neon Video Studio episode, in the app's own look:
near-black, neon pink and cyan, mono timecodes and timeline strips.

- `NeonBackground` goes on the lowest overlay track, one clip under the whole
  video. It draws the grid, a timeline ruler, a sweeping playhead and a running
  timecode, so it keeps moving across cuts.
- `NeonStage` goes on a track above it. Each clip is one shot: a chapter top
  right, a title, and a scene built from the `Items` field, one entry per line.
  The field's description in the inspector lists each scene's format.

Every word on screen comes from a field, so all of it is editable in Neon's
inspector. Animations run off the frame number, so preview and export match.
`graphics-cut.mjs` lays a cut of these under an episode's script.
