import * as esbuild from "esbuild";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: [path.join(__dirname, "src/bindhome-panel.js")],
  bundle: true,
  outfile: path.join(__dirname, "../static/bindhome-panel.js"),
  format: "iife",
  target: ["es2021"],
  minify: true,
  sourcemap: false,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for frontend changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Frontend build complete.");
}
