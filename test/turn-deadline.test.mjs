import test from "node:test";
import assert from "node:assert/strict";
import { createTurnDeadline, isTurnProgress } from "../src/server/turn-deadline.mjs";

test("only nonempty matching-turn work renews the inactivity deadline", () => {
  const event = { method: "item/reasoning/textDelta", params: { threadId: "thread", turnId: "turn", delta: "private" } };
  assert.equal(isTurnProgress(event, "thread", "turn"), true);
  assert.equal(isTurnProgress(event, "thread", "other"), false);
  assert.equal(isTurnProgress(event, "other", "turn"), false);
  assert.equal(isTurnProgress({ ...event, method: "thread/tokenUsage/updated" }, "thread", "turn"), false);
  assert.equal(isTurnProgress({ ...event, params: { ...event.params, delta: "" } }, "thread", "turn"), false);
  assert.equal(isTurnProgress({ method: "item/completed", params: { threadId: "thread", turnId: "turn", item: { id: "search", type: "webSearch" } } }, "thread", "turn"), true);
});

test("deadline disposal cancels both timers and cannot be restarted by late progress", async () => {
  const timer = createTurnDeadline({ idleMs: 10, maximumMs: 20 });
  timer.start(); timer.stop(); timer.progress(); timer.start();
  assert.equal(await Promise.race([timer.promise.then(() => "expired", () => "expired"), new Promise(resolve => setTimeout(() => resolve("disposed"), 40))]), "disposed");
});
