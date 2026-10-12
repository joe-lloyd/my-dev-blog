"""Speak lines in a cloned voice with Chatterbox, on the GPU.

Usage, inside a container that has chatterbox-tts (see voice/README.md):
  python clone.py jobs.json
jobs.json: {"ref": "refs/joe.wav", "exaggeration": 0.5, "cfg_weight": 0.5,
            "lines": [{"text": "...", "out": "out/a.wav"}, ...]}
Paths are relative to the jobs file. Lines whose output exists are skipped.
"""
import json, os, sys, time
import wave
import torch
from chatterbox.tts import ChatterboxTTS

jobs_path = sys.argv[1]
base = os.path.dirname(os.path.abspath(jobs_path))
jobs = json.load(open(jobs_path))
model = ChatterboxTTS.from_pretrained(device="cuda")
ref = os.path.join(base, jobs["ref"])
for line in jobs["lines"]:
    out = os.path.join(base, line["out"])
    if os.path.exists(out):
        continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    t = time.time()
    torch.manual_seed(line.get("seed", 7))
    wav = model.generate(line["text"], audio_prompt_path=line.get("ref") and os.path.join(base, line["ref"]) or ref,
                         exaggeration=line.get("exaggeration", jobs.get("exaggeration", 0.5)),
                         cfg_weight=line.get("cfg_weight", jobs.get("cfg_weight", 0.5)))
    pcm = (wav.squeeze(0).clamp(-1, 1) * 32767).to(torch.int16).cpu().numpy().tobytes()
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(model.sr); w.writeframes(pcm)
    print(f"{line['out']} {wav.shape[-1] / model.sr:.1f}s in {time.time() - t:.1f}s", flush=True)
