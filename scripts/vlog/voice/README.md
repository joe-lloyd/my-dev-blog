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
