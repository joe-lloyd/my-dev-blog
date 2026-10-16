# STFU waveform pack

The pack draws the STFU episode on overlay tracks, and every word on screen is a
field in Neon's inspector:

- `StfuBackground` on `STFU background` paints the ink, glow, grid and slow
  waveform. One clip runs under the whole video so it keeps moving across cuts.
  Tracks paint in order, so it must sit below `STFU graphics`.
- `StfuStage` on `STFU graphics` is the title and the one graphic a shot is
  about. Its text comes from `Title` and `Items`, one entry per line: a box per
  line in the pipeline, `Heading: text` per compare panel, a card per line, and
  so on. The field's description in the inspector lists each scene's format.
- `StfuLabels` is optional small text: brand, chapter, kicker, subtitle,
  caption and footer. Each is a field, and an empty field draws nothing. The
  STFU cut uses none; drop one on a track above the graphics where a shot
  needs a label.

Install this folder through Neon's pack library or `neon-cli packs install`.
Reinstall after editing, because `packs reload` reads the installed copy.

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
to rebuild the background clip. Starting text for each scene's Items lives in `stfu-items.mjs`.
