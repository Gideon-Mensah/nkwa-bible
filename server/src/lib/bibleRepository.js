import { createRequire } from "node:module";
import { CANONICAL_BOOKS, bookById, getBookName } from "../data/canonicalBooks.js";

const require = createRequire(import.meta.url);
const englishBible = require("../../../src/data/web_bible.json");
const twiBible = require("../../../src/data/bible.json");

export const MAX_RANGE_VERSES = 25;
export const FACT_TYPES = ["explicit", "inference", "interpretation", "disputed"];
export const CONNECTION_TYPES = ["parallel", "quotation", "fulfilment", "prophecy", "theme", "person", "event", "contrast"];

export function normalizeReference(reference) {
  if (!reference || !bookById.has(reference.bookId)) return null;
  const chapter = Number(reference.chapter);
  const verseStart = Number(reference.verseStart);
  const verseEnd = Number(reference.verseEnd ?? verseStart);
  if (![chapter, verseStart, verseEnd].every(Number.isInteger) || chapter < 1 || verseStart < 1 || verseEnd < verseStart) return null;
  const englishName = getBookName(reference.bookId, "english");
  const chapterData = englishBible.books[englishName]?.[String(chapter)];
  if (!chapterData) return null;
  for (let verse = verseStart; verse <= verseEnd; verse += 1) if (!chapterData[String(verse)]) return null;
  return { bookId: reference.bookId, chapter, verseStart, verseEnd };
}

export function formatReference(reference, language = "english") {
  const bookName = getBookName(reference.bookId, language);
  const verses = reference.verseStart === reference.verseEnd ? reference.verseStart : `${reference.verseStart}-${reference.verseEnd}`;
  return `${bookName} ${reference.chapter}:${verses}`;
}

export function getReferenceText(reference, language = "english") {
  const valid = normalizeReference(reference);
  if (!valid) return null;
  const bible = language === "twi" ? twiBible : englishBible;
  const name = getBookName(valid.bookId, language);
  const chapter = bible.books[name]?.[String(valid.chapter)];
  if (!chapter) return null;
  const parts = [];
  for (let verse = valid.verseStart; verse <= valid.verseEnd; verse += 1) {
    if (!chapter[String(verse)]) return null;
    parts.push(`${verse}. ${chapter[String(verse)]}`);
  }
  return parts.join(" ");
}

export function getChapterVerseCount(bookId, chapter) {
  const englishName = getBookName(bookId, "english");
  const chapterData = englishBible.books[englishName]?.[String(chapter)];
  return chapterData ? Math.max(...Object.keys(chapterData).map(Number)) : 0;
}

export function hydrateReference(reference, language = "english") {
  const valid = normalizeReference(reference);
  if (!valid) return null;
  return { ...valid, bookName: getBookName(valid.bookId, language), displayReference: formatReference(valid, language), verseText: getReferenceText(valid, language) };
}

export function validateSelection(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, errors: ["Request body must be a JSON object."] };
  const selectionType = body.selectionType;
  const language = body.language;
  const chapter = Number(body.chapter);
  if (!["verse", "range", "chapter"].includes(selectionType)) errors.push("selectionType must be verse, range, or chapter.");
  if (!bookById.has(body.bookId)) errors.push("bookId is not a canonical Bible book.");
  if (!Number.isInteger(chapter) || chapter < 1) errors.push("chapter must be a positive integer.");
  if (!["twi", "english"].includes(language)) errors.push("language must be twi or english.");
  if (errors.length) return { ok: false, errors };
  const englishName = getBookName(body.bookId, "english");
  const chapterData = englishBible.books[englishName]?.[String(chapter)];
  if (!chapterData) return { ok: false, errors: ["The selected chapter does not exist."] };
  let verseStart = 1;
  let verseEnd = Math.max(...Object.keys(chapterData).map(Number));
  if (selectionType !== "chapter") {
    verseStart = Number(body.verseStart);
    verseEnd = selectionType === "verse" ? verseStart : Number(body.verseEnd);
    if (!Number.isInteger(verseStart) || verseStart < 1 || !Number.isInteger(verseEnd) || verseEnd < 1) errors.push("Selected verses must be positive integers.");
    else if (verseStart > verseEnd) errors.push("verseStart must not be greater than verseEnd.");
    else if (verseEnd - verseStart + 1 > MAX_RANGE_VERSES) errors.push(`A verse range cannot exceed ${MAX_RANGE_VERSES} verses.`);
    else for (let verse = verseStart; verse <= verseEnd; verse += 1) if (!chapterData[String(verse)]) { errors.push(`Verse ${verse} does not exist in the selected chapter.`); break; }
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, selection: { selectionType, bookId: body.bookId, chapter, verseStart, verseEnd, language } };
}

export function getPassageContext(selection, radius = 3) {
  const englishName = getBookName(selection.bookId, "english");
  const chapter = englishBible.books[englishName][String(selection.chapter)];
  const maxVerse = Math.max(...Object.keys(chapter).map(Number));
  const make = (start, end) => start <= end ? hydrateReference({ bookId: selection.bookId, chapter: selection.chapter, verseStart: start, verseEnd: end }, selection.language) : null;
  return { before: make(Math.max(1, selection.verseStart - radius), selection.verseStart - 1), selected: make(selection.verseStart, selection.verseEnd), after: make(selection.verseEnd + 1, Math.min(maxVerse, selection.verseEnd + radius)) };
}

export function validateCanonicalData() {
  const errors = [];
  if (CANONICAL_BOOKS.length !== 66 || new Set(CANONICAL_BOOKS.map((book) => book.id)).size !== 66) errors.push("Canonical mapping must contain 66 unique IDs.");
  for (const book of CANONICAL_BOOKS) {
    if (!englishBible.books[book.english]) errors.push(`Missing English book ${book.english}.`);
    if (!twiBible.books[book.twi]) errors.push(`Missing Twi book ${book.twi}.`);
  }
  return errors;
}
