"""Clone narration from private reference audio and its exact transcript.

Run with python clone-qwen.py jobs.json in the Qwen image on Jellybingus.
Paths are relative to the jobs file. The caller keys cached outputs by the
voice settings and spoken text, so completed lines survive an interrupted run.
"""
import json
import os
import sys
import time

import numpy as np
import soundfile as sf
import torch
from faster_qwen3_tts import FasterQwen3TTS

jobs_path = os.path.abspath(sys.argv[1])
base = os.path.dirname(jobs_path)
with open(jobs_path) as source:
    jobs = json.load(source)
if not jobs.get('ref_text', '').strip():
    raise ValueError('Voice cloning needs the exact reference transcript')
model = FasterQwen3TTS.from_pretrained(
    jobs.get('model', 'Qwen/Qwen3-TTS-12Hz-1.7B-Base'),
    device='cuda', dtype=torch.bfloat16,
    attn_implementation='sdpa', max_seq_len=1024,
)
model.warmup()
for line in jobs['lines']:
    out = os.path.join(base, line['out'])
    if os.path.exists(out):
        continue
    torch.manual_seed(line.get('seed', 7))
    start = time.time()
    wavs, sr = model.generate_voice_clone(
        text=line['text'], language='English',
        ref_audio=os.path.join(base, line.get('ref', jobs['ref'])),
        ref_text=line.get('ref_text', jobs['ref_text']),
        xvec_only=False, non_streaming_mode=True,
        max_new_tokens=650, temperature=0.7,
    )
    wav = np.asarray(wavs[0], dtype=np.float32).reshape(-1)
    if not len(wav) or not np.isfinite(wav).all():
        raise ValueError('Invalid generated audio')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    temporary = out + '.partial.wav'
    sf.write(temporary, wav, sr, subtype='PCM_16')
    os.replace(temporary, out)
    print(json.dumps({
        'out': line['out'], 'seconds': round(len(wav) / sr, 3),
        'elapsed': round(time.time() - start, 2),
    }), flush=True)
