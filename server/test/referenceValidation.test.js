import test from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_BOOKS, getBookName } from "../src/data/canonicalBooks.js";
import { MAX_RANGE_VERSES, validateCanonicalData, validateSelection } from "../src/lib/bibleRepository.js";

test("valid verse and chapter selections", () => {
  assert.equal(validateSelection({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 16, language: "english" }).ok, true);
  assert.equal(validateSelection({ selectionType: "chapter", bookId: "acts", chapter: 12, language: "twi" }).ok, true);
});

test("invalid books, chapters, verses, reversed and oversized ranges fail", () => {
  assert.equal(validateSelection({ selectionType: "verse", bookId: "fake", chapter: 1, verseStart: 1, language: "english" }).ok, false);
  assert.equal(validateSelection({ selectionType: "chapter", bookId: "john", chapter: 999, language: "english" }).ok, false);
  assert.equal(validateSelection({ selectionType: "verse", bookId: "john", chapter: 3, verseStart: 999, language: "english" }).ok, false);
  assert.equal(validateSelection({ selectionType: "range", bookId: "john", chapter: 3, verseStart: 16, verseEnd: 15, language: "english" }).ok, false);
  assert.equal(validateSelection({ selectionType: "range", bookId: "psalms", chapter: 119, verseStart: 1, verseEnd: MAX_RANGE_VERSES + 1, language: "english" }).ok, false);
});

test("all canonical mappings and translated names resolve", () => {
  assert.equal(CANONICAL_BOOKS.length, 66);
  assert.equal(validateCanonicalData().length, 0);
  assert.equal(getBookName("first_kings", "english"), "1 Kings");
  assert.equal(getBookName("first_kings", "twi"), "1 Ahemfo");
});
