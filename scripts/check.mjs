import { readdir, readFile, access } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { translationKeys } from "../assets/i18n.js";
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else result.push(path);
  }
  return result;
}
const files = [
  ...(await walk("assets")),
  ...(await walk("tools")),
  ...(await walk("scripts")),
  ...(await walk("tests")).filter((file) => /\.(m?js)$/.test(file)),
  "index.html",
];
let failures = 0;
for (const file of files) {
  if (/\.(m?js)$/.test(file)) {
    const result = spawnSync(process.execPath, ["--check", file], {
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.error(result.stderr);
      failures++;
    }
    const source = await readFile(file, "utf8");
    if (file.startsWith("assets")) {
      for (const match of source.matchAll(/\bt\(["']([^"']+)["']\)/g)) {
        if (!translationKeys.includes(match[1])) {
          console.error(`Missing translation: ${file}: ${match[1]}`);
          failures++;
        }
      }
    }
  }
  if (file.endsWith(".html")) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      try {
        await access(resolve(dirname(file), match[1]));
      } catch {
        console.error(`Broken asset: ${file}: ${match[1]}`);
        failures++;
      }
    }
    if (!html.includes("Content-Security-Policy")) {
      console.error(`Missing CSP: ${file}`);
      failures++;
    }
  }
}
if (failures) process.exitCode = 1;
else
  console.log(`Syntax and HTML asset checks passed (${files.length} files).`);
