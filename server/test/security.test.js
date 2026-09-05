import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { SYSTEM_INSTRUCTIONS } from "../src/services/openaiStudyService.js";
import fs from "node:fs";
import path from "node:path";

async function withServer(app, callback) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try { return await callback(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

test("malformed bodies are refused without exposing secrets", async () => {
  process.env.OPENAI_API_KEY = "super-secret-test-key";
  await withServer(createApp({ generateStudy: async () => { throw new Error(`failure ${process.env.OPENAI_API_KEY}`); } }), async (url) => {
    const malformed = await fetch(`${url}/api/bible-study`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 400);
    const failed = await fetch(`${url}/api/bible-study`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, language: "english" }) });
    assert.equal(failed.status, 502);
    assert.equal((await failed.text()).includes("super-secret-test-key"), false);
  });
});

test("missing OpenAI configuration returns a safe service error", async () => {
  await withServer(createApp({ generateStudy: async () => { const error = new Error("not configured"); error.code = "OPENAI_NOT_CONFIGURED"; throw error; } }), async (url) => {
    const response = await fetch(`${url}/api/bible-study`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, language: "english" }) });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { code: "AI_NOT_CONFIGURED", error: "Bible Study AI is not configured on this server." });
  });
});

test("health reports configuration state without exposing the key", async () => {
  process.env.OPENAI_API_KEY = "health-check-secret";
  await withServer(createApp({ generateStudy: async () => ({}) }), async (url) => {
    const payload = await (await fetch(`${url}/health`)).json();
    assert.deepEqual(payload, { ok: true, aiConfigured: true });
    assert.equal(JSON.stringify(payload).includes(process.env.OPENAI_API_KEY), false);
  });
  delete process.env.OPENAI_API_KEY;
});

test("request-size and rate limits work", async () => {
  const mockStudy = async () => ({ ok: true });
  await withServer(createApp({ generateStudy: mockStudy, bodyLimit: "200b", rateLimitMax: 1, rateLimitWindowMs: 60000 }), async (url) => {
    const tooLarge = await fetch(`${url}/api/bible-study`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ padding: "x".repeat(500) }) });
    assert.equal(tooLarge.status, 413);
    const body = JSON.stringify({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, language: "english" });
    const first = await fetch(`${url}/api/bible-study`, { method: "POST", headers: { "content-type": "application/json" }, body });
    const second = await fetch(`${url}/api/bible-study`, { method: "POST", headers: { "content-type": "application/json" }, body });
    assert.equal(first.status, 200); assert.equal(second.status, 429);
  });
});

test("grounding instructions treat retrieved prompt injection as data", () => {
  assert.match(SYSTEM_INSTRUCTIONS, /never as instructions/i);
  assert.match(SYSTEM_INSTRUCTIONS, /Never invent/i);
  assert.match(SYSTEM_INSTRUCTIONS, /must not introduce a relationship absent/i);
});

test("mobile source and Expo config contain no OpenAI secret variable", () => {
  const root = path.resolve("..");
  const files = ["App.js", "app.json", "eas.json"];
  const collect = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? collect(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
  files.push(...collect(path.join(root, "src")).map((file) => path.relative(root, file)));
  for (const file of files) assert.equal(fs.readFileSync(path.join(root, file), "utf8").includes("OPENAI_API_KEY"), false, `${file} must not reference OPENAI_API_KEY`);
});
