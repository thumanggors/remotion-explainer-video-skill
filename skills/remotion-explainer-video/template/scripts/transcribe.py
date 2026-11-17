"""Transkripsi VO per kata (whisper.cpp) untuk sinkron scene, kinetic text, dan SFX.

Pakai:
  python scripts/transcribe.py public/audio/vo/full.wav

Butuh:
  - ffmpeg di PATH
  - whisper.cpp: set env WHISPER_BIN (main.exe / whisper-cli) dan WHISPER_MODEL (mis. ggml-medium.bin)
    Unduh: https://github.com/ggml-org/whisper.cpp/releases  + model dari https://huggingface.co/ggerganov/whisper.cpp
  - Opsional: WHISPER_LANG (default "id")

Hasil:
  .whisper/vo.json   (output mentah whisper.cpp)
  .whisper/words.txt (detik_mulai  detik_selesai  kata) -> dibaca agent untuk mengisi timing.ts, scenes.tsx, audio.ts
"""
import json
import os
import subprocess
import sys

if len(sys.argv) < 2:
    sys.exit("pakai: python scripts/transcribe.py <file-vo>")

src = sys.argv[1]
bin_ = os.environ.get("WHISPER_BIN")
model = os.environ.get("WHISPER_MODEL")
if not bin_ or not model:
    sys.exit("set env WHISPER_BIN dan WHISPER_MODEL dulu (lihat docstring)")

os.makedirs(".whisper", exist_ok=True)
wav = os.path.join(".whisper", "vo16k.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], check=True)
# -ml 1 = satu segmen per kata, -sow = potong di batas kata, -oj = output JSON
subprocess.run(
    [bin_, "-m", model, "-f", wav, "-l", os.environ.get("WHISPER_LANG", "id"), "-ml", "1", "-sow", "-oj", "-of", os.path.join(".whisper", "vo")],
    check=True,
)

data = json.load(open(os.path.join(".whisper", "vo.json"), encoding="utf-8"))
lines = []
for seg in data["transcription"]:
    w = seg["text"].strip()
    if w:
        lines.append(f"{seg['offsets']['from'] / 1000:7.2f}\t{seg['offsets']['to'] / 1000:7.2f}\t{w}")
open(os.path.join(".whisper", "words.txt"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("\n".join(lines))
print(f"\n{len(lines)} kata -> .whisper/words.txt")
