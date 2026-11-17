# {{JUDUL VIDEO}} — Naskah VO & SFX

Format: 1080x1920 (9:16), 60 fps, ±{{DURASI}} detik.

## Cara pasang audio
VO dibuat **pengguna**; musik & SFX dibuat **agent**.
- VO: satu file utuh `public/audio/vo/full.wav` (disarankan), atau per scene `public/audio/vo/scene-01.mp3` … (boleh `.wav` / `.m4a`).
- SFX: dibuat otomatis `python scripts/make_sfx.py` → `public/audio/sfx/*.wav` (dimix 50% di bawah VO).
- Musik latar: dibuat agent `python scripts/make_music.py <detik> <bpm> <mood>` → `public/audio/music/bg.wav` (volume 12%).
- File yang belum ada otomatis dilewati.
- Preview: `npm run dev` · Render final: `npm run render` → `out/final.mp4`

## Style prompt TTS (Gemini / TTS lain)
> {{STYLE PROMPT, contoh: "Bacakan dalam Bahasa Indonesia dengan gaya narator konten edukasi TikTok: energik, antusias, tempo cepat tapi jelas, penekanan kuat pada kata kunci, jeda singkat antar kalimat, nada naik di pertanyaan dan menutup dengan semangat."}}

---

| Scene | Waktu | Naskah VO | Teks di layar | SFX (detik dari awal scene) |
|---|---|---|---|---|
| 01 HOOK | 0:00–0:05 | "…" | … | whoosh 0 · pop 0,7 · impact 2,4 |
| 02 … | … | "…" | … | … |
| 0N RECAP & CTA | … | "… Follow untuk penjelasan lainnya!" | … / FOLLOW | pop · success |

### Catatan fakta
- {{angka/fakta penting + sumbernya, supaya bisa dicek ulang}}
