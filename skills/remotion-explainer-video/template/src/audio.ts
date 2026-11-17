import { getStaticFiles } from "remotion";

// ====== SLOT AUDIO ======
// VO   : DIBUAT PENGGUNA. public/audio/vo/full.wav (satu file utuh, disarankan)  ATAU  scene-01.mp3 ... (per scene)
// SFX  : public/audio/sfx/<nama>.wav  (buat otomatis: python scripts/make_sfx.py)
// MUSIK: public/audio/music/bg.wav     (buat otomatis: python scripts/make_music.py <detik> <bpm> <mood>)
// File yang belum ada otomatis dilewati, jadi video tetap bisa dirender tanpa audio.

const EXT = [".mp3", ".wav", ".m4a", ".aac", ".ogg"];

export const findAudio = (base: string): string | null => {
  let files: { name: string }[] = [];
  try {
    files = getStaticFiles();
  } catch {
    return null;
  }
  for (const e of EXT) {
    const n = base + e;
    if (files.some((f) => f.name.split(String.fromCharCode(92)).join("/") === n)) return n;
  }
  return null;
};

export const voPath = (sceneId: string) => findAudio(`audio/vo/${sceneId}`);
// Jika public/audio/vo/full.* ada, dipakai menggantikan VO per scene.
export const fullVoPath = () => findAudio("audio/vo/full");

export const VO_VOLUME = 1;
export const SFX_VOLUME = 0.5; // SFX dimix 50% di bawah VO
export const MUSIC = { base: "audio/music/bg", volume: 0.12 };

export type Sfx = { at: number; name: string; volume?: number };

// at = detik sejak awal scene. Setelah transkripsi VO, geser angka ini ke kata yang ditekankan.
// Nama dari make_sfx.py: whoosh pop impact ding beep click data zap riser counter signal success
export const SFX: Record<string, Sfx[]> = {
  "scene-01": [
    { at: 0, name: "whoosh" },
    { at: 0.7, name: "pop" },
    { at: 2.4, name: "impact" },
  ],
  "scene-02": [
    { at: 0, name: "whoosh" },
    { at: 0.6, name: "ding" },
    { at: 2.5, name: "data" },
    { at: 4.2, name: "pop" },
  ],
  "scene-03": [
    { at: 0.3, name: "pop" },
    { at: 1.6, name: "success" },
  ],
};
