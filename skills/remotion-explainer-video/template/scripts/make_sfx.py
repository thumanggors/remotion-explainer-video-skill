# Sintesis SFX orisinal -> public/audio/sfx/*.wav  (python scripts/make_sfx.py)
import os, wave
import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=None, curve=4.0):
    x = np.linspace(0, 1, n)
    e = np.exp(-curve * x) if r is None else np.ones(n)
    na = max(1, int(SR * a))
    e[:na] *= np.linspace(0, 1, na)
    return e


def lowpass(x, cutoff):
    # one-pole low-pass (cutoff bisa array)
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def sweep(f0, f1, d, shape="sin"):
    tt = t(d)
    f = f0 * (f1 / f0) ** (tt / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if shape == "sq":
        return np.sign(np.sin(ph))
    if shape == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    return np.sin(ph)


def tone(f, d, shape="sin"):
    return sweep(f, f, d, shape)


def save(name, x, gain=0.9):
    x = np.asarray(x, float)
    fade = min(len(x), int(SR * 0.004))
    x[-fade:] *= np.linspace(1, 0, fade)
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    st = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print("ok", name)


def pad(*parts):
    n = max(len(p) for p in parts)
    return sum(np.pad(p, (0, n - len(p))) for p in parts)


def seq(*items):
    # items: (start_sec, signal)
    n = max(int(s * SR) + len(x) for s, x in items)
    y = np.zeros(n)
    for s, x in items:
        i = int(s * SR)
        y[i : i + len(x)] += x
    return y


# whoosh: noise dengan filter naik-turun
d = 0.7
n = rng.standard_normal(int(SR * d))
cut = 300 + 5000 * np.sin(np.linspace(0, np.pi, len(n))) ** 2
save("whoosh", lowpass(n, cut) * np.sin(np.linspace(0, np.pi, len(n))) ** 1.5, 0.8)

# pop: sine pitch jatuh cepat
save("pop", sweep(900, 220, 0.12) * env(int(SR * 0.12), 0.002, curve=9))

# impact: sub boom + noise crack
d = 0.9
boom = sweep(110, 38, d) * env(int(SR * d), 0.002, curve=5)
crack = lowpass(rng.standard_normal(int(SR * 0.15)), 2500) * env(int(SR * 0.15), 0.001, curve=14)
save("impact", pad(boom, crack * 0.8))

# ding: bel harmonik
d = 1.2
e = env(int(SR * d), 0.002, curve=4)
save("ding", (tone(1320, d) + 0.5 * tone(2640, d) * env(int(SR * d), 0.002, curve=7) + 0.25 * tone(3960, d) * env(int(SR * d), 0.002, curve=10)) * e, 0.7)

# beep: dua nada digital
b = lambda f: tone(f, 0.08, "sq") * env(int(SR * 0.08), 0.002, curve=1)
save("beep", lowpass(seq((0, b(1000)), (0.11, b(1500))), 6000), 0.5)

# click: transien pendek
save("click", lowpass(rng.standard_normal(int(SR * 0.03)), 7000) * env(int(SR * 0.03), 0.0005, curve=20) + 0.6 * sweep(2500, 800, 0.03) * env(int(SR * 0.03), 0.0005, curve=20), 0.7)

# data: rangkaian blip acak (transfer data)
items = []
for i in range(14):
    f = rng.choice([800, 1200, 1600, 2000, 2400])
    items.append((i * 0.045, tone(f, 0.03, "sq") * env(int(SR * 0.03), 0.001, curve=2)))
save("data", lowpass(seq(*items), 5000), 0.45)

# zap: laser sweep turun
d = 0.45
save("zap", lowpass(sweep(2400, 180, d, "saw"), 5000) * env(int(SR * d), 0.002, curve=4) + 0.5 * sweep(1800, 140, d) * env(int(SR * d), 0.002, curve=4), 0.7)

# riser: nada naik + noise naik
d = 1.6
ramp = np.linspace(0, 1, int(SR * d)) ** 2
save("riser", (sweep(150, 1200, d, "saw") * 0.4 + lowpass(rng.standard_normal(int(SR * d)), 400 + 6000 * ramp) * 0.6) * ramp, 0.6)

# counter: tik cepat (angka berjalan)
tick = tone(2200, 0.012) * env(int(SR * 0.012), 0.0005, curve=6)
save("counter", seq(*[(i * 0.06, tick * (0.6 + 0.4 * i / 26)) for i in range(27)]), 0.5)

# signal: gelombang radio wobble
d = 1.2
tt = t(d)
fm = 700 + 250 * np.sin(2 * np.pi * 6 * tt)
sig = np.sin(2 * np.pi * np.cumsum(fm) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 10 * tt))
save("signal", sig * np.sin(np.linspace(0, np.pi, len(tt))), 0.45)

# success: arpeggio mayor naik
notes = [523.25, 659.25, 783.99, 1046.5]
items = [(i * 0.09, (tone(f, 0.5) + 0.3 * tone(f * 2, 0.5)) * env(int(SR * 0.5), 0.003, curve=5)) for i, f in enumerate(notes)]
save("success", seq(*items), 0.7)
