# STFU waveform pack

The pack draws the STFU episode in three layers, one overlay track each, so a
layer can be hidden or trimmed without touching the others:

- `StfuBackground` on `STFU background` paints the ink, glow, grid and slow
  waveform. One clip runs under the whole video so it keeps moving across cuts.
- `StfuStage` on `STFU graphics` is the heading and the one graphic a shot is
  about: the pipeline, before and after text, recording pill, cards or a
  settings still. It is transparent.
- `StfuLabels` on `STFU labels` holds everything small: brand, chapter, kicker,
  subtitle, footer, pipeline step notes and the pill's state captions. It takes
  the same fields as the stage clip under it. Delete a labels clip to drop the
  labels from that shot, or hide the track to drop them all.

Tracks paint in order, so `STFU background` must sit below `STFU graphics` and
`STFU labels` above it. The stage and labels share one heading column, so a
title that wraps still pushes the subtitle down. Install this folder through
Neon's pack library or `neon-cli packs install`.

The inspector exposes the scene, heading, subtitle, chapter and optional image URL.
Animations use the clip frame, so the preview and export agree. Each scene scales
from a 1920 by 1080 layout. Settings images accept embedded PNG data URLs so they
travel with the saved project.

The pill and pasted message are illustrated demonstrations with example text.
They do not call a speech provider. Label them as demonstrations when used in a cut.

`stage-cut.mjs` combines this pack with the existing TTS pipeline. Keep an episode's
unpublished narration and generated audio outside the repository. Give each line
`say`, `show`, `scene`, `title`, `subtitle` and optionally `image`, a PNG path relative
to the episode folder. Copy the episode's `out/tts` folder to the remote episode
folder before running the assembler.

The assembler targets a script project with matching sections and an overlay
track named `STFU graphics`. It keeps the existing notes, section status and
one editable text box per section. Review questions stay below the draft narration.
It writes a checkpoint and refuses to replace an existing cut. Run
`layer-stage.mjs <neonRepo> <host>` afterwards, and again after `revoice-stage.mjs`,
to rebuild the background and labels layers from the stage clips.
