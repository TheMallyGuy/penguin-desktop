import { join } from "node:path";
import { Glob } from "bun";
import { $ } from "bun";

const ONLINE_EDITOR = join(import.meta.dir, "../online-editor");
const BUILD_WEB = join(import.meta.dir, "../build-web");
const SRC_BUILD = join(ONLINE_EDITOR, "build");

console.log("Building penguinmod editor");
await $`cd ${ONLINE_EDITOR} && npm run build`;

console.log("Copying build output to build-web...");
for await (const entry of new Glob("**/*").scan(SRC_BUILD)) {
  await Bun.write(join(BUILD_WEB, entry), Bun.file(join(SRC_BUILD, entry)));
}

console.log("Build complete!");

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

console.log(`Serving at http://localhost:${server.port}`);

