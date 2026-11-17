---
name: remotion-explainer-video
description: Buat video edukasi/explainer vertikal (TikTok/Reels/Shorts) 1080x1920 60fps dengan Remotion dari sebuah topik. Mencakup folder per judul, naskah VO per scene + daftar SFX, style prompt TTS, animasi penuh dengan kinetic text UPPERCASE dan efek zoom, render preview tanpa audio, sinkron VO per kata (whisper.cpp), sintesis SFX orisinal, mix audio, render final, dan caption TikTok. Gunakan saat user minta "buat video Remotion", "video explainer", "video cara kerja X", atau video pendek beranimasi dengan voice over.
---

# Remotion Explainer Video

Alur kerja lengkap untuk membuat video explainer vertikal dari **satu input: topik/judul video**.
Template proyek siap pakai ada di `template/` (relatif terhadap file ini).

## Spesifikasi default (ubah hanya kalau user minta)
- 1080x1920 (9:16), **60 fps**, durasi ±45–75 detik, 6–10 scene.
- Full animasi (ilustrasi SVG vektor yang bergerak, bukan slide statis), full warna di latar gelap.
- **Kinetic text UPPERCASE bold** (Montserrat 900), kata muncul satu per satu dengan pop/zoom.
- Efek **zoom**: kamera zoom/pan antar elemen (`Camera`), transisi zoom-through antar scene.
- Bahasa naskah mengikuti bahasa user (default Bahasa Indonesia).

## Langkah kerja

### 1. Folder baru sesuai judul
Buat folder baru bernama **judul video dalam UPPERCASE** (mis. `CARA KERJA VSAT`) di direktori kerja video user.
Salin seluruh isi `template/` ke folder itu. Install dependensi:
- Jika ada folder video sebelumnya dengan `node_modules` versi Remotion yang sama, salin/junction `node_modules` itu (jauh lebih cepat).
- Kalau tidak, `npm install`.

Ubah `name` di `package.json` menjadi slug judul.

### 2. Riset & naskah (sebelum coding)
- Kumpulkan fakta yang benar tentang topik; catat angka penting + sumber di bagian "Catatan fakta".
- Struktur: **Hook** (pertanyaan/kejutan, ≤5 dtk) → penjelasan bertahap (satu ide per scene) → **Recap & CTA** ("Follow untuk …").
- Isi `NASKAH-VO-SFX.md`: tabel per scene berisi waktu, naskah VO, teks di layar (UPPERCASE, pendek), dan SFX + detiknya.
- Tulis **style prompt TTS** (Gemini TTS atau lainnya) di file yang sama, contoh:
  > Bacakan dalam Bahasa Indonesia dengan gaya narator konten edukasi TikTok: energik, antusias, tempo cepat tapi jelas, penekanan kuat pada kata kunci, jeda singkat antar kalimat, nada naik di pertanyaan.
- Tampilkan naskah ke user. User akan merekam/generate VO sendiri.

### 3. Bangun animasi
File penting di template:
| File | Isi |
|---|---|
| `src/theme.ts` | FPS, ukuran, font, palet warna `C`, easing |
| `src/timing.ts` | daftar `SCENES` (id, judul, detik) + `TRANSITION` |
| `src/scenes.tsx` | komponen scene (`S1`, `S2`, …) + `SCENE_COMPONENTS` — **ganti sesuai topik** |
| `src/text.tsx` | `KLine` (kinetic text per kata), `Chip` (label pop), `fmtId` (angka format id-ID) |
| `src/util.tsx` | `prog`, `usePop`, `Camera` (zoom/pan keyframe), `World` (kanvas SVG), `Backdrop`, `Vignette` |
| `src/audio.ts` | slot VO/SFX/musik + jadwal `SFX` per scene |
| `src/Video.tsx` | rangkaian scene, transisi zoom-through, mix audio |

Aturan desain:
- Setiap scene punya gerak terus-menerus (zoom pelan, objek melayang, partikel) — tidak ada frame diam.
- Teks besar (≥90px), maksimal ±4 kata per baris, warna kontras / blok warna (`bg`) untuk kata kunci.
- Simpan teks di zona aman: hindari 250px bawah (UI TikTok) dan tepi kanan (tombol).
- Ilustrasi: SVG buatan sendiri (lingkaran, path, gradien). Jangan memakai aset/brand berhak cipta.
- Satu ide visual per scene; gunakan `Camera` untuk zoom in ke detail lalu zoom out ke gambaran besar.

### 4. QA & render preview tanpa audio
```bash
npx tsc --noEmit
node scripts/stills.mjs 60 300 600 900      # still di frame tertentu -> out/qa/
npm run render:preview                       # out/preview.mp4 (tanpa audio)
```
Lihat still: cek teks tidak terpotong/bertumpuk, kontras, zona aman. Kirim preview ke user.

### 5. Sinkron dengan VO user
User menaruh VO di `public/audio/vo/full.wav` (satu file, disarankan) atau `scene-01.mp3`… per scene.
```bash
python scripts/transcribe.py public/audio/vo/full.wav   # -> .whisper/words.txt (detik per kata)
```
(butuh ffmpeg + whisper.cpp; set env `WHISPER_BIN` dan `WHISPER_MODEL`, model `ggml-medium` disarankan untuk Bahasa Indonesia.)

Dari `words.txt`:
- `timing.ts`: durasi tiap scene = dari kata pertama scene itu sampai kata pertama scene berikutnya (pergantian di jeda kalimat). Ingat transisi `TRANSITION` frame tumpang-tindih.
- `scenes.tsx`: setiap `KLine at={…}` = detik kata itu diucapkan × 60, dikurangi awal scene. Teks muncul tepat saat kata diucapkan (boleh 2–4 frame lebih awal).
- `audio.ts`: geser `at` SFX ke kata/aksi yang ditekankan.
Render still lagi di titik-titik sinkron untuk cek.

### 6. SFX orisinal + mix
```bash
python scripts/make_sfx.py    # butuh numpy; membuat 12 SFX .wav ke public/audio/sfx/
```
SFX dimix **50% di bawah VO** (`SFX_VOLUME = 0.5` di `audio.ts`). Musik latar opsional di `public/audio/music/bg.mp3` (12%).
Tambah SFX baru dengan menulis fungsi sintesis baru di `make_sfx.py` — jangan unduh SFX dari internet tanpa izin lisensi.

### 7. Render final
```bash
npm run render   # out/final.mp4, h264 crf 18, audio 320k
```
Cek durasi, audio terdengar, dan sinkron di awal/tengah/akhir.

### 8. Caption TikTok
Buat caption berisi: hook 1 baris, 2–3 baris ringkasan poin, CTA (follow/komen pertanyaan), 5–8 hashtag (campuran umum + niche topik). Simpan ke `CAPTION.md` di folder video.

## Checklist selesai
- [ ] Folder judul UPPERCASE berisi proyek Remotion yang bisa dirender
- [ ] `NASKAH-VO-SFX.md` (naskah per scene, teks layar, SFX, style prompt TTS, catatan fakta)
- [ ] `out/preview.mp4` (tanpa audio) sudah dikirim
- [ ] VO tersinkron per kata, SFX dibuat & dimix 50%
- [ ] `out/final.mp4` + `CAPTION.md`
