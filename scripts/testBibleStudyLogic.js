const fs = require("fs");
const vm = require("vm");
const babel = require("@babel/core");
const assert = require("assert");

function loadModule(filename, mocks = {}) {
  const code = babel.transformSync(fs.readFileSync(filename, "utf8"), { plugins: ["@babel/plugin-transform-modules-commonjs"], filename }).code;
  const moduleRecord = { exports: {} };
  const context = { module: moduleRecord, exports: moduleRecord.exports, require: (name) => mocks[name] || require(name), process: { env: {} }, URL, AbortController, setTimeout, clearTimeout, fetch, console, Date, Error, TypeError, JSON, Array, String, Number, Object, __DEV__: false };
  vm.runInNewContext(code, context);
  return moduleRecord.exports;
}

(async () => {
  const service = loadModule("src/services/bibleStudyService.js");
  assert.deepEqual(service.buildStudyRequest({ selectionType: "verse", bookId: "john", chapter: "3", verseStart: "16", verseEnd: 16, language: "english", passageText: "must not send" }), { selectionType: "verse", bookId: "john", chapter: 3, language: "english", verseStart: 16 });
  assert.deepEqual(service.buildStudyRequest({ selectionType: "chapter", bookId: "acts", chapter: 12, language: "twi" }), { selectionType: "chapter", bookId: "acts", chapter: 12, language: "twi" });
  let requestBody;
  const validStudy = { reference: {}, passageText: "text", summary: "summary", immediateContext: {}, genealogy: [], people: [], places: [], crossReferences: [], oldNewTestamentConnections: [], prophecyAndFulfilment: [], themes: [], historicalBackground: [], interpretiveNotes: [], limitations: [] };
  assert.equal(service.getBibleStudyApiOrigin("https://example.test///"), "https://example.test");
  assert.throws(() => service.getBibleStudyApiOrigin(""), (error) => error.code === "MISSING_API_URL");
  await service.requestBibleStudy({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, language: "english" }, { baseUrl: "https://example.test", fetchImpl: async (url, options) => { if (url.endsWith("/health")) return { ok: true, status: 200, json: async () => ({ ok: true, aiConfigured: true }) }; requestBody = JSON.parse(options.body); return { ok: true, status: 200, json: async () => validStudy }; } });
  assert.equal(requestBody.bookId, "john"); assert.equal("passageText" in requestBody, false);
  await assert.rejects(() => service.requestBibleStudy({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, language: "english" }, { baseUrl: "https://example.test", fetchImpl: async () => { throw new TypeError("offline"); } }), (error) => error.code === "BACKEND_UNREACHABLE");

  const storage = new Map();
  const asyncStorage = { getItem: async (key) => storage.get(key) || null, setItem: async (key, value) => storage.set(key, value), removeItem: async (key) => storage.delete(key) };
  const cache = loadModule("src/services/bibleStudyCache.js", { "@react-native-async-storage/async-storage": { __esModule: true, default: asyncStorage } });
  const selection = { selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, verseEnd: 16, language: "english" };
  await cache.cacheStudy(selection, validStudy, 1000);
  assert.equal(JSON.stringify(await cache.getCachedStudy(selection, 1001)), JSON.stringify(validStudy));
  assert.equal(await cache.getCachedStudy({ ...selection, language: "twi" }, 1001), null);
  console.log("Mobile Bible Study request privacy, canonical selections, offline errors, cache hits, and language-specific cache keys passed.");
})().catch((error) => { console.error(error); process.exit(1); });
