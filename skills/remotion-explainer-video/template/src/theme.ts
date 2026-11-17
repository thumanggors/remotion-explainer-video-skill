import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Easing } from "remotion";

const mont = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
export const FONT = mont.fontFamily;

export const FPS = 60;
export const W = 1080;
export const H = 1920;

// Full-colour palette on deep space navy.
export const C = {
  bg0: "#040714",
  bg1: "#0B1640",
  cyan: "#22D3EE",
  blue: "#3B82F6",
  magenta: "#EC4899",
  yellow: "#FACC15",
  orange: "#FB923C",
  lime: "#A3E635",
  green: "#22C55E",
  purple: "#A855F7",
  red: "#EF4444",
  white: "#FFFFFF",
  ink: "#0A0F24",
} as const;

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
