import { createRequire } from "node:module";
import { CONNECTION_TYPES, hydrateReference, normalizeReference } from "./bibleRepository.js";

const require = createRequire(import.meta.url);
let index = {};
try { index = require("../data/crossReferences.json"); } catch { index = {}; }

export function retrieveCrossReferences(selection, limit = 16) {
  const ranked = new Map();
  for (let verse = selection.verseStart; verse <= selection.verseEnd; verse += 1) {
    const links = index[`${selection.bookId}.${selection.chapter}.${verse}`] || [];
    for (const [bookId, chapter, verseStart, verseEnd, votes] of links) {
      const key = `${bookId}.${chapter}.${verseStart}.${verseEnd}`;
      const existing = ranked.get(key);
      if (!existing || votes > existing.votes) ranked.set(key, { reference: { bookId, chapter, verseStart, verseEnd }, votes });
    }
  }
  return [...ranked.values()].sort((a, b) => b.votes - a.votes).slice(0, limit);
}

export function validateAndHydrateCrossReferences(items, language) {
  const seen = new Set();
  const valid = [];
  for (const item of Array.isArray(items) ? items : []) {
    const reference = normalizeReference(item.reference);
    if (!reference || !CONNECTION_TYPES.includes(item.connectionType)) continue;
    const key = `${reference.bookId}.${reference.chapter}.${reference.verseStart}.${reference.verseEnd}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const hydrated = hydrateReference(reference, language);
    valid.push({ ...item, reference: { bookId: hydrated.bookId, bookName: hydrated.bookName, chapter: hydrated.chapter, verseStart: hydrated.verseStart, verseEnd: hydrated.verseEnd, displayReference: hydrated.displayReference }, verseText: hydrated.verseText });
  }
  return valid;
}

export function validateCrossReferenceIndex(data = index) {
  const errors = [];
  for (const [source, targets] of Object.entries(data)) {
    const [bookId, chapter, verse] = source.split(".");
    if (!normalizeReference({ bookId, chapter: Number(chapter), verseStart: Number(verse), verseEnd: Number(verse) })) errors.push(`Invalid cross-reference source ${source}.`);
    for (const target of targets) if (!normalizeReference({ bookId: target[0], chapter: target[1], verseStart: target[2], verseEnd: target[3] })) errors.push(`Invalid cross-reference target from ${source}.`);
  }
  return errors;
}
