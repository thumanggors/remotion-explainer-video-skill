// QA: render still di frame tertentu -> out/qa/f<frame>.jpg  (node scripts/stills.mjs 120 600 ...)
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "Main" });
console.log("durasi", composition.durationInFrames);
fs.mkdirSync("out/qa", { recursive: true });
for (const fr of process.argv.slice(2).map(Number)) {
  await renderStill({ serveUrl, composition, frame: fr, output: `out/qa/f${fr}.jpg`, imageFormat: "jpeg", jpegQuality: 70, scale: 0.4 });
  console.log("ok", fr);
}
