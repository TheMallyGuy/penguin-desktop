import { watch } from "fs";
import { join } from "path";
import { $ } from "bun";

const TS_DIR = join(import.meta.dir, "../src-tauri/src/typescript");
const BAKE_CMD = ["bun", "run", "bake"];
const BUILD_WEB = join(import.meta.dir, "../dist");

console.log(`Watching ${TS_DIR} for changes...`);

let building = false;
let dirty = false;

async function bake() {
  if (building) {
    dirty = true;
    return;
  }
  building = true;
  dirty = false;
  try {
    await $`${BAKE_CMD}`;
    console.log("[bake] done");
  } catch (e) {
    console.error("[bake] failed:", e);
  }
  building = false;
  if (dirty) bake();
}

// bake once on start
await bake();

await Bun.write(join(BUILD_WEB, "desktop.html"), Bun.file(join(import.meta.dir, "..", "src-tauri", "src", "desktop.html")));


watch(TS_DIR, { recursive: true }, (_event, filename) => {
  if (filename?.endsWith(".ts")) {
    console.log(`[watch] ${filename} changed`);
    bake();
  }
});

// keep alive
setTimeout(() => { }, 1 << 30);
