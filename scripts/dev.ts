const frontend = Bun.spawn(["bun", "run", "build:frontend:serve"], { stdout: "inherit", stderr: "inherit" });
const baker = Bun.spawn(["bun", "run", "bake:watch"], { stdout: "inherit", stderr: "inherit" });

const cleanup = () => {
  frontend.kill();
  baker.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

await Promise.all([frontend.exited, baker.exited]);
