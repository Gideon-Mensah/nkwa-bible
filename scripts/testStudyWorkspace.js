const fs = require("fs");
const vm = require("vm");
const babel = require("@babel/core");
const assert = require("node:assert/strict");

function load(filename, mocks = {}) {
  const code = babel.transformSync(fs.readFileSync(filename, "utf8"), {
    plugins: ["@babel/plugin-transform-modules-commonjs", "@babel/plugin-transform-react-jsx"], filename,
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, require: (name) => mocks[name] || require(name),
    console, Date, Math, Error, JSON, Array, String, Number, Object, Promise, setTimeout, clearTimeout,
  });
  return module.exports;
}

function memoryStorage(initial = {}) {
  const records = new Map(Object.entries(initial));
  const writes = [];
  return { records, writes, getItem: async (key) => records.get(key) ?? null,
    setItem: async (key, value) => { writes.push(key); records.set(key, value); } };
}

const collectionModule = load("src/services/storedCollection.js");
const utils = load("src/utils/studyWorkspace.js");

// Exercise the real context operations without a native runtime or new test dependency.
function contextProvider(filename, exportName, storage) {
  let providerValue;
  const effects = [];
  const React = {
    createContext: () => ({ Provider: "provider" }),
    createElement: (type, props) => { providerValue = props.value; return null; },
    useState: (initial) => [initial, () => {}],
    useRef: (initial) => ({ current: initial }),
    useCallback: (callback) => callback,
    useEffect: (effect) => effects.push(effect),
  };
  const module = load(filename, {
    react: { __esModule: true, default: React, ...React },
    "react/jsx-runtime": { jsx: (type, props) => { providerValue = props.value; return null; } },
    "@react-native-async-storage/async-storage": { __esModule: true, default: storage },
    "../services/storedCollection": collectionModule,
    "../utils/studyWorkspace": utils,
  });
  module[exportName]({ children: null });
  effects.forEach((effect) => effect());
  return providerValue;
}

(async () => {
  const { createStoredCollection } = collectionModule;
  for (const raw of ["{broken", "{}", "null", '[null]']) {
    const storage = memoryStorage({ notes: raw });
    const store = createStoredCollection(storage, "notes", () => {}, () => {});
    assert.equal(await store.load(), false);
    assert.equal(await store.update(() => []), false);
    assert.equal(storage.records.get("notes"), raw);
    assert.equal(storage.writes.length, 0);
  }

  const storage = memoryStorage({ notes: JSON.stringify([{ id: "old", note: "Ɛyɛ ɔdɔ", unknown: true }]) });
  const store = createStoredCollection(storage, "notes", () => {}, () => {});
  await Promise.all([
    store.load(),
    store.update((items) => [...items, { id: "one" }]),
    store.update((items) => [...items, { id: "two" }]),
  ]);
  assert.deepEqual(JSON.parse(storage.records.get("notes")).map((item) => item.id), ["old", "one", "two"]);
  const beforeFailure = storage.records.get("notes");
  const originalWrite = storage.setItem;
  storage.setItem = async () => { throw new Error("disk full"); };
  assert.equal(await store.update(() => []), false);
  assert.equal(storage.records.get("notes"), beforeFailure);
  storage.setItem = originalWrite;
  await store.update((items) => [...items, { id: "retry" }]);
  assert.equal(JSON.parse(storage.records.get("notes")).length, 4);

  const notesStorage = memoryStorage({ notes: JSON.stringify([{ id: "legacy", book: "Yohane", chapter: "3", verse: "16", language: "twi", note: "old", custom: "keep" }]) });
  const notes = contextProvider("src/context/NoteContext.js", "NoteProvider", notesStorage);
  const draft = { id: "stable-draft", book: "Yohane", chapter: "3", language: "twi", note: "ɛ ɔ Ɛ Ɔ" };
  await Promise.all([notes.saveNote(draft), notes.saveNote({ ...draft, note: "ɛ ɔ Ɛ Ɔ updated" }), notes.updateNote("legacy", "edited")]);
  const savedNotes = JSON.parse(notesStorage.records.get("notes"));
  assert.equal(savedNotes.length, 2);
  assert.equal(savedNotes[0].custom, "keep");
  assert.equal(savedNotes[1].note, "ɛ ɔ Ɛ Ɔ updated");
  assert.ok(savedNotes[1].createdAt);
  await notes.deleteNote("stable-draft");
  assert.equal(JSON.parse(notesStorage.records.get("notes")).length, 1);

  const sermonStorage = memoryStorage({ sermons: JSON.stringify([{ id: "old", title: "Original", createdAt: "2020", custom: true }]), bookmarks: "untouched", highlights: "untouched", lastRead: "untouched", bibleLanguage: "twi" });
  const sermons = contextProvider("src/context/SermonContext.js", "SermonProvider", sermonStorage);
  await Promise.all([
    sermons.addSermon({ id: "new", title: "New", notes: "ɔdɔ" }),
    sermons.addSermon({ id: "new", title: "New", notes: "ɔdɔ" }),
    sermons.updateSermon("old", { title: "Edited", id: "wrong", createdAt: "wrong" }),
  ]);
  const savedSermons = JSON.parse(sermonStorage.records.get("sermons"));
  assert.equal(savedSermons.length, 2);
  assert.equal(savedSermons[1].createdAt, "2020");
  assert.equal(savedSermons[1].id, "old");
  assert.equal(savedSermons[1].custom, true);
  assert.deepEqual([...new Set(sermonStorage.writes)], ["sermons"]);
  await sermons.deleteSermon("new");
  assert.equal(JSON.parse(sermonStorage.records.get("sermons")).length, 1);

  assert.equal(utils.usesStudyColumns(899, 1024), false);
  assert.equal(utils.usesStudyColumns(900, 1024), true);
  assert.equal(utils.usesStudyColumns(1024, 768), true);
  assert.equal(utils.usesStudyColumns(956, 440), false); // Landscape phone
  assert.equal(utils.usesStudyColumns(1024, 768, 1.4), false);
  assert.equal(utils.passageReference({ book: "Yohane", chapter: 3 }), "Yohane 3");
  assert.equal(utils.passageReference({ book: "Yohane", chapter: 3, verse: 16 }), "Yohane 3:16");
  assert.equal(utils.appendText("Existing", "Ɛ ɔ"), "Existing\n\nƐ ɔ");
  assert.throws(() => utils.normalizeSermon({ title: " " }));
  assert.equal(utils.normalizeSermon({ title: " Ɔdɔ " }).title, "Ɔdɔ");

  const pdf = load("src/utils/sermonPdf.js", { "expo-print": {}, "expo-sharing": {}, "expo-file-system": {} });
  const html = pdf.createSermonPdfHtml({ title: "Ɛyɛ ɔdɔ <script>", notes: "Ɛ ɔ\nsecond line" });
  assert.ok(html.includes("Ɛyɛ ɔdɔ &lt;script&gt;"));
  assert.ok(html.includes("Ɛ ɔ<br>second line"));

  const config = JSON.parse(fs.readFileSync("app.json", "utf8")).expo;
  assert.equal(config.ios.supportsTablet, true);
  assert.equal(config.orientation, "default");
  console.log("Study workspace: corrupt/read/write safety, queued updates, stable note/sermon IDs, legacy fields, Twi, deletion, responsive layout, references, sermon validation, PDF HTML and tablet config passed.");
})().catch((error) => { console.error(error); process.exit(1); });
