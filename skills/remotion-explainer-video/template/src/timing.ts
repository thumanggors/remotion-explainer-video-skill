// Durasi default tiap scene (detik). Setelah VO ada, sesuaikan dengan hasil transkripsi
// (scripts/transcribe.py) supaya pergantian scene jatuh tepat di jeda kalimat.
// Jika VO per scene (public/audio/vo/scene-XX.*) ada, durasi otomatis memanjang (Root.tsx).
export type SceneDef = { id: string; title: string; sec: number };

export const SCENES: SceneDef[] = [
  { id: "scene-01", title: "HOOK", sec: 4.5 },
  { id: "scene-02", title: "PENJELASAN", sec: 7 },
  { id: "scene-03", title: "CTA", sec: 5 },
];

export const TRANSITION = 18; // frame, zoom-through antar scene
