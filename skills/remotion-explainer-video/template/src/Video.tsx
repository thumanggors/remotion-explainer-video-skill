import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { SCENE_COMPONENTS } from "./scenes";
import { SCENES, TRANSITION } from "./timing";
import { MUSIC, SFX, SFX_VOLUME, VO_VOLUME, findAudio, fullVoPath, voPath } from "./audio";
import { FPS } from "./theme";
import { Backdrop, Vignette } from "./util";

// Transisi zoom-through + kilatan cahaya
type NoProps = Record<string, never>;
const ZoomPres: React.FC<TransitionPresentationComponentProps<NoProps>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const exiting = presentationDirection === "exiting";
  return (
    <AbsoluteFill
      style={{
        opacity: exiting ? 1 - p : Math.min(1, p * 1.6),
        transform: exiting ? `scale(${1 + p * 0.7})` : `scale(${0.75 + 0.25 * p})`,
      }}
    >
      {children}
      {!exiting && <AbsoluteFill style={{ background: "#fff", opacity: Math.sin(p * Math.PI) * 0.22, pointerEvents: "none" }} />}
    </AbsoluteFill>
  );
};
const zoomThrough = (): TransitionPresentation<NoProps> => ({ component: ZoomPres, props: {} });

export type VideoProps = { durations: number[] };

export const Video: React.FC<VideoProps> = ({ durations }) => {
  const { durationInFrames } = useVideoConfig();
  const starts: number[] = [];
  durations.reduce((acc, d, i) => {
    starts[i] = acc;
    return acc + d;
  }, 0);
  const music = findAudio(MUSIC.base);
  const fullVo = fullVoPath();
  return (
    <AbsoluteFill>
      <Backdrop />
      <TransitionSeries>
        {SCENE_COMPONENTS.map((Scene, i) => {
          const last = i === SCENE_COMPONENTS.length - 1;
          const d = durations[i] + (last ? 0 : TRANSITION);
          return (
            <React.Fragment key={i}>
              <TransitionSeries.Sequence durationInFrames={d}>
                <Scene dur={d} />
              </TransitionSeries.Sequence>
              {!last && <TransitionSeries.Transition presentation={zoomThrough()} timing={linearTiming({ durationInFrames: TRANSITION })} />}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      <Vignette />

      {/* ===== AUDIO: VO + SFX (otomatis dilewati jika file belum ada) ===== */}
      {SCENES.map((s, i) => {
        const vo = fullVo ? null : voPath(s.id);
        return (
          <Sequence key={s.id} from={starts[i]} durationInFrames={durations[i] + (i === SCENES.length - 1 ? 0 : TRANSITION)} name={`AUDIO ${s.id}`}>
            {vo && <Audio src={staticFile(vo)} volume={VO_VOLUME} />}
            {(SFX[s.id] ?? []).map((x, j) => {
              const file = findAudio(`audio/sfx/${x.name}`);
              if (!file) return null;
              return (
                <Sequence key={j} from={Math.round(x.at * FPS)} name={`sfx ${x.name}`}>
                  <Audio src={staticFile(file)} volume={(x.volume ?? 1) * SFX_VOLUME} />
                </Sequence>
              );
            })}
          </Sequence>
        );
      })}
      {fullVo && <Audio src={staticFile(fullVo)} volume={VO_VOLUME} />}
      {music && (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) => interpolate(f, [0, 30, durationInFrames - 90, durationInFrames], [0, MUSIC.volume, MUSIC.volume, 0], { extrapolateRight: "clamp" })}
        />
      )}
    </AbsoluteFill>
  );
};
