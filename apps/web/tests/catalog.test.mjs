import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const entries = JSON.parse(readFileSync(new URL("../src/data/catalog.json", import.meta.url), "utf8"));
const kinds = new Set(["language", "concept", "technology"]);

test("preview catalog uses unique stable identifiers", () => {
  assert.ok(entries.length >= 9);
  const ids = entries.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const entry of entries) {
    assert.ok(kinds.has(entry.kind), `Unknown category: ${entry.kind}`);
    assert.match(entry.id, /^(language|concept|technology)\.[a-z0-9.-]+$/);
    assert.ok(entry.slug && entry.name && entry.summary);
    assert.ok(entry.tags.length > 0);
  }
});

test("preview never claims executable support", () => {
  assert.ok(entries.every((entry) => entry.runnable === false));
});

test("preview covers all categories and COW", () => {
  for (const kind of kinds) assert.ok(entries.some((entry) => entry.kind === kind));
  assert.ok(entries.some((entry) => entry.id === "language.cow"));
});
