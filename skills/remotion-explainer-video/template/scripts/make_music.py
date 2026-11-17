# Sintesis musik latar orisinal -> public/audio/music/bg.wav
# Pakai: python scripts/make_music.py [detik=70] [bpm=110] [mood=upbeat|calm|tense]
import os, sys, wave
import numpy as np

SR = 44100
dur = float(sys.argv[1]) if len(sys.argv) > 1 else 70
bpm = float(sys.argv[2]) if len(sys.argv) > 2 else 110
mood = sys.argv[3] if len(sys.argv) > 3 else "upbeat"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "music")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(3)

# Progresi akor (nada MIDI) per mood
PROG = {
    "upbeat": [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],  # Am F C G
    "calm": [[48, 52, 55, 59], [45, 48, 52, 55], [53, 57, 60, 64], [55, 59, 62, 65]],
    "tense": [[50, 53, 57], [50, 53, 58], [48, 51, 55], [49, 53, 56]],
}[mood]

hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / bpm
bar = beat * 4
n = int(SR * dur)
y = np.zeros(n)


def add(sig, start):
    i = int(start * SR)
    if i >= n:
        return
    j = min(n, i + len(sig))
    y[i:j] += sig[: j - i]


def note(f, d, shape="saw", decay=3.0):
    tt = np.arange(int(SR * d)) / SR
    ph = 2 * np.pi * f * tt
    s = np.sin(ph) if shape == "sin" else 2 * ((f * tt) % 1) - 1
    return s * np.exp(-decay * tt / d) * np.minimum(1, tt / 0.01)


t = 0.0
k = 0
while t < dur:
    ch = PROG[k % len(PROG)]
    for m in ch:  # pad akor, lembut
        add(0.10 * note(hz(m), bar, "sin", 1.2) + 0.03 * note(hz(m), bar, "saw", 1.5), t)
    for b in range(4):  # bass per ketukan
        add(0.30 * note(hz(ch[0] - 12), beat * 0.9, "sin", 4), t + b * beat)
        if mood != "calm":  # hi-hat
            hh = rng.standard_normal(int(SR * 0.04)) * np.exp(-np.arange(int(SR * 0.04)) / (SR * 0.008))
            add(0.06 * np.diff(hh, prepend=0), t + b * beat + beat / 2)
        if mood == "upbeat" and b % 2 == 0:  # kick
            kt = np.arange(int(SR * 0.25)) / SR
            add(0.45 * np.sin(2 * np.pi * (50 + 90 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 12), t + b * beat)
    for i in range(8):  # arpeggio
        add(0.05 * note(hz(ch[i % len(ch)] + 12), beat / 2, "sin", 5), t + i * beat / 2)
    t += bar
    k += 1

fade = int(SR * 2)
y[:fade] *= np.linspace(0, 1, fade)
y[-fade:] *= np.linspace(1, 0, fade)
y = y / (np.max(np.abs(y)) + 1e-9) * 0.8
st = np.stack([y, y], 1)
with wave.open(os.path.join(OUT, "bg.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f"ok bg.wav {dur:.0f}s {bpm:.0f}bpm {mood}")
