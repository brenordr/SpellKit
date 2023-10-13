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
  const core = Bun.build({
    ...commonOptions,
  });

  // React specific
  const react = Bun.build({
    ...commonOptions,
    entrypoints: ["./lib/react/index.ts"],
    outdir: "./dist/esm/react",
  });

  // Middleware specific
  const middleware = Bun.build({
    ...commonOptions,
    entrypoints: ["./lib/middleware/index.ts"],
    outdir: "./dist/esm/middleware",
  });

  const success = (await Promise.all([core, react, middleware])).reduce(
    (acc, cur) => {
      return acc && cur.success;
    },
    true
  );

  if (!success) {
    throw new Error("Build failed");
  }
}

build();
