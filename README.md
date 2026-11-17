# Remotion Explainer Video — Skill untuk AI Agent

Skill agent AI untuk membuat **video explainer vertikal (TikTok / Reels / Shorts)** dengan [Remotion](https://www.remotion.dev/), cukup dari **satu topik**. Dipakai di Claude Code, Codex, Hermes Agent, dan agent lain yang mendukung format [Agent Skills](https://agentskills.io) (`SKILL.md`) atau `AGENTS.md`.

Lahir dari pembuatan video "CARA KERJA VSAT", lalu dijadikan generik.

## Yang dikerjakan agent
0. **Bertanya dulu** saat kamu mengirim ide (penonton, poin wajib, durasi, gaya, mood musik, referensi) supaya hasilnya akurat.
1. Membuat **folder baru sesuai judul video** (UPPERCASE) dari template.
2. **Mencari referensi gambar & fakta dari browser** seakurat mungkin (sumber dicatat di `REFERENSI.md`), lalu menulis **naskah VO per scene + daftar SFX** dan **style prompt TTS** (mis. Gemini TTS) di `NASKAH-VO-SFX.md`.
3. Membangun animasi penuh: **1080x1920, 60 fps**, ilustrasi SVG bergerak, **kinetic text UPPERCASE bold**, full warna, **efek zoom** kamera + transisi zoom-through.
4. QA dengan still frame, lalu **render preview tanpa audio**.
5. Kamu menaruh VO → agent **mentranskripsi per kata** (whisper.cpp) untuk menyinkronkan pergantian scene, kinetic text, dan SFX.
6. **Membuat musik latar & SFX sendiri** (`make_music.py`, `make_sfx.py`, tanpa aset berhak cipta); SFX dimix 50% di bawah VO.
7. **Render final** + menulis **caption TikTok**.

## Pembagian audio
| Lapisan | Dibuat oleh |
|---|---|
| VO (voice over) | **Kamu** (rekam sendiri / TTS dari naskah + style prompt yang dibuat agent) |
| Musik latar | **Agent** (`make_music.py`) |
| SFX | **Agent** (`make_sfx.py`) |

## Isi repo
```
AGENTS.md                                  # instruksi untuk Codex & agent lain
skills/remotion-explainer-video/
  SKILL.md                                 # alur kerja lengkap (format Agent Skills)
  template/                                # proyek Remotion siap salin
    src/        theme, timing, scenes (contoh), text (kinetic text), util (Camera/zoom), audio, Video
    scripts/    make_sfx.py · make_music.py · transcribe.py · stills.mjs
    NASKAH-VO-SFX.md                       # template naskah
```

## Prasyarat
- Node.js 18+ dan npm
- Python 3 + `numpy` (`pip install numpy`)
- ffmpeg di PATH
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp/releases) + model (mis. `ggml-medium.bin`) untuk sinkron VO. Set env:
  ```bash
  export WHISPER_BIN=/path/ke/whisper-cli      # Windows: main.exe / whisper-cli.exe
  export WHISPER_MODEL=/path/ke/ggml-medium.bin
  ```

## Instalasi per agent

Clone dulu:
```bash
git clone https://github.com/thumanggors/remotion-explainer-video-skill.git
```

### Claude Code
Salin folder skill ke direktori skill pribadi (berlaku di semua proyek):
```bash
cp -r remotion-explainer-video-skill/skills/remotion-explainer-video ~/.claude/skills/
```
Atau per proyek: `.claude/skills/remotion-explainer-video/`. Skill otomatis terpakai saat kamu minta "buat video Remotion tentang …".

### Codex (OpenAI Codex CLI)
```bash
mkdir -p ~/.codex/skills
cp -r remotion-explainer-video-skill/skills/remotion-explainer-video ~/.codex/skills/
```
Versi Codex tanpa dukungan skills: salin `AGENTS.md` dan folder `skills/` ke root folder kerja video kamu; Codex membaca `AGENTS.md` otomatis.

### Hermes Agent
```bash
mkdir -p ~/.hermes/skills
cp -r remotion-explainer-video-skill/skills/remotion-explainer-video ~/.hermes/skills/
```

### Agent lain (Cursor, Gemini CLI, OpenCode, dll.)
Kebanyakan agent membaca `AGENTS.md` di root proyek. Salin `AGENTS.md` dan folder `skills/` ke folder kerja video, atau arahkan agent untuk membaca `skills/remotion-explainer-video/SKILL.md`.

> Lokasi folder skill bisa berubah antar versi agent; cek dokumentasi agent kamu jika skill tidak terdeteksi.

## Contoh pemakaian
> Buat video Remotion "CARA KERJA WIFI".

Agent membuat folder `CARA KERJA WIFI/`, menulis naskah + SFX + style prompt TTS, lalu mengirim preview. Setelah kamu menaruh `public/audio/vo/full.wav`, minta: *"VO sudah ada, sinkronkan dan render final."*

## Perintah di folder video
| Perintah | Fungsi |
|---|---|
| `npm run dev` | Remotion Studio (preview interaktif) |
| `node scripts/stills.mjs 60 300 600` | still frame QA → `out/qa/` |
| `npm run render:preview` | preview tanpa audio → `out/preview.mp4` |
| `python scripts/transcribe.py public/audio/vo/full.wav` | transkripsi per kata → `.whisper/words.txt` |
| `npm run sfx` | buat 12 SFX orisinal → `public/audio/sfx/` |
| `python scripts/make_music.py 60 110 upbeat` | musik latar orisinal → `public/audio/music/bg.wav` |
| `npm run render` | render final → `out/final.mp4` |

## Lisensi
MIT. Perhatikan bahwa Remotion memiliki [lisensinya sendiri](https://www.remotion.dev/license) (gratis untuk individu & tim kecil, perusahaan tertentu butuh lisensi).
