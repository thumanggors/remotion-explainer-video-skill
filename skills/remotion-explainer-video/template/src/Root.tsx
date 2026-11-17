import React from "react";
import { Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Video, VideoProps } from "./Video";
import { FPS, H, W } from "./theme";
import { SCENES } from "./timing";
import { fullVoPath, voPath } from "./audio";

const defaults = SCENES.map((s) => Math.round(s.sec * FPS));
const total = (d: number[]) => d.reduce((a, b) => a + b, 0);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Main"
    component={Video}
    fps={FPS}
    width={W}
    height={H}
    durationInFrames={total(defaults)}
    defaultProps={{ durations: defaults } satisfies VideoProps}
    // VO per scene: durasi scene = max(default, panjang VO + 0,4 dtk).
    // VO full: durasi mengikuti timing.ts (sinkronkan dari hasil transkripsi).
    calculateMetadata={async () => {
      if (fullVoPath()) return { durationInFrames: total(defaults), props: { durations: defaults } };
      const durations = await Promise.all(
        SCENES.map(async (s, i) => {
          const vo = voPath(s.id);
          if (!vo) return defaults[i];
          try {
            const sec = await getAudioDurationInSeconds(staticFile(vo));
            return Math.max(defaults[i], Math.ceil((sec + 0.4) * FPS));
          } catch {
            return defaults[i];
          }
        })
      );
      return { durationInFrames: total(durations), props: { durations } };
    }}
  />
);
