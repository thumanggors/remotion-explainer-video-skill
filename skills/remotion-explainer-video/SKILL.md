---
name: remotion-explainer-video
description: Buat video edukasi/explainer vertikal (TikTok/Reels/Shorts) 1080x1920 60fps dengan Remotion dari sebuah topik. Mencakup pertanyaan klarifikasi ide, riset referensi gambar & fakta dari browser, folder per judul, naskah VO per scene + daftar SFX, style prompt TTS, animasi penuh dengan kinetic text UPPERCASE dan efek zoom, render preview tanpa audio, sinkron VO per kata (whisper.cpp), sintesis musik latar & SFX orisinal oleh agent (VO dibuat pengguna), mix audio, render final, dan caption TikTok. Gunakan saat user minta "buat video Remotion", "video explainer", "video cara kerja X", atau video pendek beranimasi dengan voice over.
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

## Aturan audio (WAJIB)
| Lapisan | Dibuat oleh | Keterangan |
|---|---|---|
| **VO (voice over)** | **Pengguna** | Agent hanya menulis naskah + style prompt TTS. Jangan pernah membuat/men-generate VO sendiri. Tunggu file VO dari pengguna. |
| **Musik latar** | **Agent** | Disintesis sendiri dengan `scripts/make_music.py` (orisinal, bebas hak cipta). Volume 12%, fade in/out. |
| **SFX** | **Agent** | Disintesis sendiri dengan `scripts/make_sfx.py`. Dimix 50% di bawah VO. |

Jangan mengunduh musik/SFX dari internet. Jika pengguna memberi musik sendiri, pakai milik pengguna sebagai pengganti `bg.wav`.

## Langkah kerja

### 0. Klarifikasi ide (tanya dulu sebelum mengerjakan)
Saat pengguna mengirim ide/topik, **ajukan pertanyaan singkat dalam satu pesan** supaya hasilnya akurat. Tanya hanya yang belum jelas dari pesan pengguna, berikan opsi/default agar mudah dijawab. Contoh:
1. Target penonton? (awam / pelajar / teknisi)
2. Sudut pandang atau poin utama yang wajib masuk? Ada yang harus dihindari?
3. Durasi? (default 60 detik)
4. Gaya visual & warna? (default: latar gelap full warna, kinetic text UPPERCASE)
5. Mood musik? (upbeat / calm / tense)
6. Bahasa & gaya VO? CTA di akhir? (default: "Follow untuk …")
7. Ada referensi (link, gambar, video contoh, data/angka resmi) yang harus dipakai?

Kalau pengguna menjawab "bebas"/"terserah", pakai default dan sebutkan default yang dipakai. Jangan menebak fakta yang hanya pengguna yang tahu (merek, produk sendiri, data internal).

### 1. Folder baru sesuai judul
Buat folder baru bernama **judul video dalam UPPERCASE** (mis. `CARA KERJA VSAT`) di direktori kerja video user.
Salin seluruh isi `template/` ke folder itu. Install dependensi:
- Jika ada folder video sebelumnya dengan `node_modules` versi Remotion yang sama, salin/junction `node_modules` itu (jauh lebih cepat).
- Kalau tidak, `npm install`.

Ubah `name` di `package.json` menjadi slug judul.

### 2. Riset referensi dari browser & naskah (sebelum coding)
Gunakan tool browser/web search yang tersedia di agent untuk mencari bahan **seakurat mungkin**:
- **Fakta & angka**: utamakan sumber primer (situs resmi, dokumentasi teknis, standar, jurnal, Wikipedia hanya sebagai titik awal). Cocokkan minimal 2 sumber untuk setiap angka. Catat URL di "Catatan fakta".
- **Referensi gambar**: cari foto/diagram nyata dari objek yang dijelaskan (bentuk, warna, proporsi, urutan komponen, arah alur) supaya ilustrasi SVG yang digambar akurat. Simpan daftar link referensi di `REFERENSI.md` (link + apa yang dipelajari dari gambar itu).
- Gambar referensi dipakai **sebagai acuan menggambar ulang**, bukan ditempel ke video, kecuali lisensinya jelas mengizinkan (mis. domain publik / CC) dan sumbernya dicantumkan.
- Jika fakta antar sumber berbeda atau tidak ditemukan, tanyakan ke pengguna atau tulis versi yang paling aman; jangan mengarang angka.
- Jika agent tidak punya akses browser, beri tahu pengguna dan minta mereka mengirim referensi.

Lalu tulis naskah:
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

### 6. Musik & SFX buatan agent + mix
```bash
python scripts/make_sfx.py                      # 12 SFX .wav -> public/audio/sfx/
python scripts/make_music.py <detik> <bpm> <mood>  # musik latar -> public/audio/music/bg.wav (mood: upbeat|calm|tense)
```
Durasi musik = durasi video (lihat output `stills.mjs`: durasi frame ÷ 60). SFX dimix **50% di bawah VO** (`SFX_VOLUME = 0.5`), musik 12% (`MUSIC.volume`).
Tambah SFX/variasi musik dengan menulis fungsi sintesis baru di script tersebut, bukan mengunduh dari internet.

### 7. Render final
```bash
npm run render   # out/final.mp4, h264 crf 18, audio 320k
```
Cek durasi, audio terdengar, dan sinkron di awal/tengah/akhir.

### 8. Caption TikTok
Buat caption berisi: hook 1 baris, 2–3 baris ringkasan poin, CTA (follow/komen pertanyaan), 5–8 hashtag (campuran umum + niche topik). Simpan ke `CAPTION.md` di folder video.

## Checklist selesai
- [ ] Pertanyaan klarifikasi sudah dijawab (atau default disebutkan)
- [ ] `REFERENSI.md` + catatan fakta bersumber dari browser
- [ ] Folder judul UPPERCASE berisi proyek Remotion yang bisa dirender
- [ ] `NASKAH-VO-SFX.md` (naskah per scene, teks layar, SFX, style prompt TTS, catatan fakta)
- [ ] `out/preview.mp4` (tanpa audio) sudah dikirim
- [ ] VO dari pengguna tersinkron per kata; musik & SFX dibuat agent, SFX dimix 50%
- [ ] `out/final.mp4` + `CAPTION.md`
