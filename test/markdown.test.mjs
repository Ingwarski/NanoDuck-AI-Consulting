import assert from "node:assert/strict";
import test from "node:test";
import { parseInline, parseMarkdown, safeMarkdownHref } from "../public/client/markdown.js";

test("restricted Markdown preserves Ember-style emphasis, lists and quotations as structured content", () => {
  assert.deepEqual(parseInline("Use **evidence** and *one* `measure` [source](https://example.com/report)."), [
    { type: "text", value: "Use " }, { type: "strong", value: "evidence" }, { type: "text", value: " and " }, { type: "emphasis", value: "one" }, { type: "text", value: " " }, { type: "code", value: "measure" }, { type: "text", value: " " }, { type: "link", value: "source", href: "https://example.com/report" }, { type: "text", value: "." }
  ]);
  const blocks = parseMarkdown("## Decision\n\n1. **Measure** demand\n2. *Review* conversion\n\n> **Critic:** test the assumption.");
  assert.deepEqual(blocks.map(block => block.type), ["heading", "list", "quote"]);
  assert.equal(blocks[1].ordered, true);
  assert.deepEqual(blocks[1].items[0], [{ type: "strong", value: "Measure" }, { type: "text", value: " demand" }]);
});

test("escaped syntax and unsafe links remain inert text", () => {
  assert.deepEqual(parseInline("\\**literal emphasis\\**"), [{ type: "text", value: "**literal emphasis**" }]);
  assert.deepEqual(parseInline("[blocked](https://example.su/report)"), [{ type: "text", value: "[blocked](https://example.su/report)" }]);
  assert.deepEqual(parseInline('<img src=x onerror="alert(1)">'), [{ type: "text", value: '<img src=x onerror="alert(1)">' }]);
  assert.equal(safeMarkdownHref("https://localhost/private"), undefined);
  assert.equal(safeMarkdownHref("https://example.com/public"), "https://example.com/public");
});
