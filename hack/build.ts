import { BuildConfig } from "bun";

async function build() {
  // Common config
  const commonOptions: BuildConfig = {
    format: "esm",
    target: "browser",
    minify: true,
    external: ["react"],
    splitting: true,
    loader: { ".ts": "ts", ".tsx": "tsx" },
    entrypoints: ["./lib/core/index.ts"],
    outdir: "./dist/esm/core",
  };

  // Core
  await Bun.build({
    ...commonOptions,
  });

  // React specific
  await Bun.build({
    ...commonOptions,
    entrypoints: ["./lib/react/index.ts"],
    outdir: "./dist/esm/react",
  });

  // Middleware specific
  await Bun.build({
    ...commonOptions,
    entrypoints: ["./lib/middleware/index.ts"],
    outdir: "./dist/esm/middleware",
  });

  // ... Do this for react and middleware too
}

build();
