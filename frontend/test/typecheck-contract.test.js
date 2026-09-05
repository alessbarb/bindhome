import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const tscPath = fileURLToPath(
  new URL("../node_modules/typescript/bin/tsc", import.meta.url),
);

test("checkJs rejects an invalid JavaScript JSDoc assignment", () => {
  const directory = mkdtempSync(join(tmpdir(), "bindhome-checkjs-"));
  const fixture = join(directory, "invalid.js");

  try {
    writeFileSync(
      fixture,
      '/** @type {number} */\nconst value = "not-a-number";\nvoid value;\n',
      "utf8",
    );

    const result = spawnSync(
      process.execPath,
      [
        tscPath,
        "--noEmit",
        "--allowJs",
        "--checkJs",
        "--skipLibCheck",
        "--target",
        "ES2022",
        fixture,
      ],
      { encoding: "utf8" },
    );

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /TS2322/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
