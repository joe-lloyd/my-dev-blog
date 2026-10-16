# Cloned voice

`tts.mjs` can speak an episode in Joe's own voice with Chatterbox, which clones a voice from a
short reference clip. It runs on Jellybingus's GPU in a one-off container:

```sh
docker run --rm --gpus all --entrypoint python -e HF_HOME=/hf \
  -v C:/Users/joell/.cache/huggingface:/hf -v C:/Users/joell/vlog/voice:/work -w /work \
  nsfwgen-tts clone.py jobs.json
```

`nsfwgen-tts` is only borrowed for its Python environment (chatterbox-tts 0.1.6, torch with
CUDA 12.8); nothing of that project runs. Model weights sit in the HuggingFace cache.

The references are 12 to 16 second clips cut from Joe's stfu dictation history, in
`C:\Users\joell\vlog\voice\refs\` on Jellybingus. They are private recordings: they stay on that
box and are never committed or published. Generated speech is fine to publish, since it is the
point of the exercise. To change the voice, put a new clip in `refs/` and set `voice.ref` in the
episode. A lower `cfg` gives slower, calmer narration.

Speed: about one second of speech per second on the 3090. A 10-minute episode takes about ten
minutes.

## A better reference

The first clone, from a stfu dictation clip, came out with an Australian lilt. The reference was
recorded on a poor mic and in casual speech, and a low `cfg` follows the reference least. For the
next attempt, record a purpose-made reference:

- 1 to 2 minutes of Joe reading script-like text at narration pace, on a good mic, close up,
  in a quiet room, with noise suppression and auto-gain off. Save as WAV.
- Cut a clean 15 to 20 second stretch into `refs/`, then compare Chatterbox at `cfg` 0.5 with
  other cloning models (Qwen3-TTS is already on Jellybingus, F5-TTS) on the same lines.

## Transcript-conditioned Qwen3 cloning

The STFU accent correction uses `voice.engine: 'qwen3'` with the 1.7B Base
model. Chatterbox still drifted toward Australian on the opening at cfg 0.85,
using both the mic take and a dictation reference. Qwen3 receives the reference
recording and its exact words, with `xvec_only=False`, so it can copy how the
words are spoken as well as the speaker identity.

Keep the reference transcript private alongside the episode. Set `voice.ref`
to the reference basename and `voice.refText` to its transcript. `voice.model`
can name a cached Hugging Face model or an absolute path inside the container.
`voice.seed` defaults to 7. Changes to this configuration invalidate the audio
cache. When replacing a reference recording under the same name, change a
configuration field such as `voice.referenceRevision` to invalidate old takes.

`tts.mjs` runs `voice/clone-qwen.py` in a disposable `chinese-speech:latest`
container on Jellybingus. It needs `faster-qwen3-tts` 0.3.2, qwen-tts 0.1.1,
and CUDA PyTorch. It mounts the existing `chinese-speech-data` model volume
and the private `vlog/voice` folder. It does not change the running speech
service. Model files must already be present because generation runs offline.

For a graphics cut already built with `stage-cut.mjs`, use
`revoice-stage.mjs <episodeDir> <neonRepo> <host> <remoteEpisodeDir>` with Bun.
It replaces the narration and retimes each existing shot and script box to the
new recording. Graphic properties, script words and section notes stay intact.
It refuses an unexpected cut layout or frame notes that need manual retiming.
Keep the previous project and audio before regenerating.

Accent-classifier scores are supporting evidence, not listening approval or
probabilities. Compare the same spoken text against the old take and check
transcriptions separately. Let Joe judge whether the result sounds like him.
