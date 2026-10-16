# STFU waveform pack

`StfuStage` draws the STFU episode's waveform background, title cards, pipeline,
before-and-after text, recording pill and settings shots. Install this folder
through Neon's pack library or `neon-cli packs install`.

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
It writes a checkpoint and refuses to replace an existing cut.
