import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, H, W, ease, easeInOut } from "./theme";

// Progres 0..1 dari frame `start` selama `dur` frame (dengan easing).
export const prog = (f: number, start: number, dur: number, e: (t: number) => number = ease) =>
  interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Spring "pop" yang mulai di frame `start`.
export const usePop = (start: number, damping = 12, stiffness = 160) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - start, fps, config: { damping, stiffness, mass: 0.8 } });
};

// ---------- Kamera: zoom + pan ke titik fokus (koordinat dunia 1080x1920) ----------
export type CamKey = { f: number; s: number; x: number; y: number };

export const camAt = (frame: number, keys: CamKey[]): CamKey => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const t = easeInOut(Math.min(1, Math.max(0, (frame - a.f) / Math.max(1, b.f - a.f))));
      return { f: frame, s: lerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
  }
  return keys[keys.length - 1];
};

export const Camera: React.FC<{ keys: CamKey[]; children: React.ReactNode }> = ({ keys, children }) => {
  const f = useCurrentFrame();
  const { s, x, y } = camAt(f, keys);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: W,
          height: H,
          transformOrigin: "0 0",
          transform: `translate(${W / 2 - x * s}px, ${H / 2 - y * s}px) scale(${s})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// Kanvas SVG seukuran layar untuk ilustrasi vektor.
export const World: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", overflow: "visible" }}>
    {children}
  </svg>
);

// ---------- Latar: gradien + glow bergerak + partikel ----------
const DOTS = new Array(140).fill(0).map((_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * H,
  r: 0.8 + random(`sr${i}`) * 2.4,
  p: random(`sp${i}`) * Math.PI * 2,
  sp: 0.03 + random(`ss${i}`) * 0.06,
}));

export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg0} 0%, ${C.bg1} 55%, #12093A 100%)` }}>
      <div style={{ position: "absolute", left: -300, top: 120 + Math.sin(f / 200) * 40, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.22), transparent 65%)" }} />
      <div style={{ position: "absolute", right: -320, top: 900 + Math.cos(f / 240) * 50, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.18), transparent 65%)" }} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {DOTS.map((s, i) => (
          <circle key={i} cx={(s.x - f * 0.15 * (s.r / 3) + W) % W} cy={s.y} r={s.r} fill="#fff" opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(f * s.sp + s.p))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Gelapkan tepi layar supaya teks terbaca.
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
);
