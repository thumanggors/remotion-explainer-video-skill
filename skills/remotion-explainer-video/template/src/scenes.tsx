// CONTOH SCENE. Ganti isinya sesuai topik video; jumlah komponen harus sama dengan SCENES di timing.ts.
// Semua angka waktu dalam FRAME (60 fps): detik × 60. Ambil dari transkripsi VO (scripts/transcribe.py).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chip, KLine } from "./text";
import { C } from "./theme";
import { Camera, World, prog, usePop } from "./util";

export type SP = { dur: number };

// Node ilustrasi sederhana (lingkaran + ikon huruf). Ganti dengan ilustrasi SVG sesuai topik.
const Node: React.FC<{ x: number; y: number; r: number; color: string; label: string; p: number }> = ({ x, y, r, color, label, p }) => (
  <g transform={`translate(${x} ${y}) scale(${p})`}>
    <circle r={r * 1.35} fill={color} opacity={0.18} />
    <circle r={r} fill={color} stroke="#fff" strokeWidth={8} />
    <text textAnchor="middle" dy={r * 0.35} fontSize={r} fontWeight={900} fill={C.ink} fontFamily="sans-serif">
      {label}
    </text>
  </g>
);

// ===================== SCENE 1 — HOOK (pertanyaan pemancing + zoom pelan) =====================
export const S1: React.FC<SP> = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 270], [0.85, 1.15], { extrapolateRight: "clamp" });
  const p = usePop(30);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${z}) rotate(${interpolate(f, [0, 270], [-5, 0], { extrapolateRight: "clamp" })}deg)` }}>
        <World>
          <Node x={540} y={1050} r={210} color={C.cyan} label="?" p={p} />
        </World>
      </AbsoluteFill>
      <KLine segs={[{ t: "PERNAH" }, { t: "KEPIKIRAN?", c: C.yellow }]} at={6} y={200} size={120} />
      <KLine segs={[{ t: "CARA KERJANYA", bg: C.magenta }]} at={70} y={1450} size={104} />
      <KLine segs={[{ t: "GIMANA?!", c: C.lime }]} at={130} y={1600} size={150} shake />
    </AbsoluteFill>
  );
};

// ===================== SCENE 2 — PENJELASAN (kamera zoom/pan antar elemen) =====================
const A = { x: 300, y: 1150 };
const B = { x: 780, y: 650 };

export const S2: React.FC<SP> = () => {
  const f = useCurrentFrame();
  const pa = usePop(10);
  const pb = usePop(150);
  const line = prog(f, 90, 60);
  const dot = (f % 60) / 60;
  return (
    <AbsoluteFill>
      <Camera
        keys={[
          { f: 0, s: 1.6, x: A.x, y: A.y }, // fokus ke A
          { f: 100, s: 1.6, x: A.x, y: A.y },
          { f: 170, s: 1.0, x: 540, y: 900 }, // zoom out lihat alur
          { f: 300, s: 1.5, x: B.x, y: B.y }, // zoom ke B
        ]}
      >
        <World>
          <line x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * line} y2={A.y + (B.y - A.y) * line} stroke={C.yellow} strokeWidth={14} strokeDasharray="30 22" strokeLinecap="round" />
          {line >= 1 && <circle cx={A.x + (B.x - A.x) * dot} cy={A.y + (B.y - A.y) * dot} r={22} fill={C.white} />}
          <Node x={A.x} y={A.y} r={130} color={C.lime} label="A" p={pa} />
          <Node x={B.x} y={B.y} r={130} color={C.orange} label="B" p={pb} />
        </World>
      </Camera>
      <Chip text="Langkah #1" at={10} x={70} y={150} color={C.purple} />
      <KLine segs={[{ t: "DATA DIKIRIM" }, { t: "DARI A", c: C.lime }]} at={20} y={260} size={100} out={140} />
      <KLine segs={[{ t: "SAMPAI KE" }, { t: "B!", bg: C.orange, c: C.ink }]} at={160} y={260} size={110} />
    </AbsoluteFill>
  );
};

// ===================== SCENE 3 — RECAP & CTA =====================
export const S3: React.FC<SP> = () => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 8) * 0.04;
  return (
    <AbsoluteFill>
      <KLine segs={[{ t: "SIMPEL" }, { t: "KAN?", c: C.yellow }]} at={6} y={600} size={160} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", transform: `scale(${pulse})` }}>
        <Chip text="Follow untuk lainnya!" at={60} x={0} y={0} color={C.magenta} size={70} center />
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_COMPONENTS: React.FC<SP>[] = [S1, S2, S3];
