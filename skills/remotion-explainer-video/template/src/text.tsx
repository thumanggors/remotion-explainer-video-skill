import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";

export type Seg = { t: string; c?: string; bg?: string };

// Kinetic text: tiap kata "pop" (zoom + naik + sedikit rotasi), berurutan.
export const KLine: React.FC<{
  segs: Seg[];
  at: number;
  y: number;
  size?: number;
  out?: number;
  stagger?: number;
  align?: "center" | "left";
  x?: number;
  shake?: boolean;
  weight?: number;
}> = ({ segs, at, y, size = 100, out, stagger = 5, align = "center", x = 60, shake = false, weight = 900 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at - 1) return null;
  const words: { w: string; c?: string; bg?: string }[] = [];
  segs.forEach((s) => s.t.split(" ").forEach((w) => w && words.push({ w: w.toUpperCase(), c: s.c, bg: s.bg })));
  const outP = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  if (outP >= 1) return null;
  const sh = shake ? Math.sin(f * 1.7) * 6 * Math.max(0, 1 - (f - at) / 40) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? 50 : x,
        right: 50,
        top: y,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `${size * 0.08}px ${size * 0.3}px`,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: -size * 0.02,
        transform: `translateX(${sh}px) scale(${1 - outP * 0.4})`,
        opacity: 1 - outP,
      }}
    >
      {words.map((w, i) => {
        const p = spring({ frame: f - at - i * stagger, fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
        const o = interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: w.c ?? C.white,
              background: w.bg,
              padding: w.bg ? `${size * 0.04}px ${size * 0.16}px` : undefined,
              borderRadius: w.bg ? size * 0.14 : undefined,
              transform: `translateY(${(1 - p) * size * 0.7}px) scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
              opacity: o,
              textShadow: w.bg ? "0 6px 0 rgba(0,0,0,0.25)" : `0 8px 0 rgba(0,0,0,0.45), 0 0 34px ${(w.c ?? "#ffffff") + "66"}`,
              boxShadow: w.bg ? "0 10px 0 rgba(0,0,0,0.35)" : undefined,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// Chip kecil (label) dengan pop
export const Chip: React.FC<{ text: string; at: number; x: number; y: number; color: string; size?: number; dark?: boolean; out?: number; center?: boolean }> = ({
  text,
  at,
  x,
  y,
  color,
  size = 44,
  dark = false,
  out,
  center = false,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const p = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 180 } });
  const o = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: center ? 0 : x,
        right: center ? 0 : undefined,
        top: y,
        display: "flex",
        justifyContent: center ? "center" : "flex-start",
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color: dark ? C.ink : C.white,
          background: color,
          padding: `${size * 0.18}px ${size * 0.45}px`,
          borderRadius: size * 0.3,
          transform: `scale(${p}) rotate(${(1 - p) * -10}deg)`,
          boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
          whiteSpace: "nowrap",
          letterSpacing: -size * 0.01,
        }}
      >
        {text.toUpperCase()}
      </div>
    </div>
  );
};

export const fmtId = (n: number) => Math.round(n).toLocaleString("id-ID");
