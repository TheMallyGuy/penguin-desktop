import { join } from "node:path";
import { Glob } from "bun";

const LINES = 2;

async function run(cmd: string[], cwd?: string): Promise<void> {
  const proc = Bun.spawn(cmd, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const buffer: string[] = [];
  let lastUpdate = 0;
  let rendered = 0;

  const redraw = () => {
    if (rendered > 0) {
      process.stdout.write("\x1b[1A\x1b[2K".repeat(rendered));
    }
    process.stdout.write(buffer.map(l => `> ${l}`).join("\n") + "\n");
    rendered = buffer.length;
  };

  const processStream = async (stream: ReadableStream<Uint8Array>) => {
    const decoder = new TextDecoder();
    for await (const chunk of stream) {
      for (const line of decoder.decode(chunk).split("\n")) {
        if (line) {
          buffer.push(line);
          if (buffer.length > LINES) buffer.splice(0, buffer.length - LINES);
        }
      }
      const now = Date.now();
      if (now - lastUpdate > 100) {
        redraw();
        lastUpdate = now;
      }
    }
  };

  await Promise.all([
    processStream(proc.stdout),
    processStream(proc.stderr),
  ]);

  await proc.exited;
  redraw();
  process.stdout.write("\n");
}

const ROOT = join(import.meta.dir, "..");
const ONLINE_EDITOR = join(import.meta.dir, "../online-editor");
const PACKAGER = join(import.meta.dir, "../packager");
const PACKAGER_SRC_BUILD = join(PACKAGER, "dist");
const BUILD_WEB = join(import.meta.dir, "../build-dev");
const BUILD_PACKAGER = join(import.meta.dir, "../build-dev", "packager");
const SRC_BUILD = join(ONLINE_EDITOR, "build");

console.log("Building penguinmod editor");
await run(["bun", "run", "build"], ONLINE_EDITOR);
console.log("Building packager");
await run(["bun", "run", "build"], PACKAGER);

console.log("Copying build output to build-dev...");
for await (const entry of new Glob("**/*").scan(SRC_BUILD)) {
  await Bun.write(join(BUILD_WEB, entry), Bun.file(join(SRC_BUILD, entry)));
}
for await (const entry of new Glob("**/*").scan(PACKAGER_SRC_BUILD)) {
  await Bun.write(join(BUILD_PACKAGER, entry), Bun.file(join(PACKAGER_SRC_BUILD, entry)));
}

console.log("Copying desktop file...");
await Bun.write(join(BUILD_WEB, "desktop.html"), Bun.file(join(import.meta.dir, "..", "src-tauri", "src", "desktop.html")));

console.log("Build complete!");

console.log("Baking typescripts");
await run(["bun", "run", "bake"], ROOT);

console.log("Baked!");

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const filePath = join(BUILD_WEB, pathname);
    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Now serving at http://localhost:${server.port}`);   