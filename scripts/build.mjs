import { mkdir, cp, writeFile, rm } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";
const output = resolve("dist");
if (dirname(output) !== process.cwd() || basename(output) !== "dist")
  throw new Error("Build output must be the workspace dist/ directory.");
await rm(output, { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const path of ["index.html", "assets", "tools"])
  await cp(path, `dist/${path}`, { recursive: true });
await writeFile("dist/.nojekyll", "");
console.log("Static site copied to dist/ (no dependencies or bundling).");
