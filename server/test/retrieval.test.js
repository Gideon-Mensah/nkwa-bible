import test from "node:test";
import assert from "node:assert/strict";
import { validateAndHydrateCrossReferences, validateCrossReferenceIndex } from "../src/lib/crossReferences.js";
import { relationships, retrieveRelationships, traverseRelationships, validateRelationships } from "../src/lib/relationships.js";
import { getPassageContext } from "../src/lib/bibleRepository.js";

test("cross-reference index validates", () => assert.deepEqual(validateCrossReferenceIndex(), []));

test("cross-references remove invalid and duplicate items and hydrate both languages", () => {
  const items = [
    { reference: { bookId: "romans", chapter: 5, verseStart: 8, verseEnd: 8 }, connectionType: "theme", relevance: "Love", factType: "inference" },
    { reference: { bookId: "romans", chapter: 5, verseStart: 8, verseEnd: 8 }, connectionType: "theme", relevance: "Duplicate", factType: "inference" },
    { reference: { bookId: "fake", chapter: 1, verseStart: 1, verseEnd: 1 }, connectionType: "theme", relevance: "Invalid", factType: "inference" },
  ];
  const english = validateAndHydrateCrossReferences(items, "english");
  const twi = validateAndHydrateCrossReferences(items, "twi");
  assert.equal(english.length, 1); assert.equal(twi.length, 1);
  assert.equal(english[0].reference.bookName, "Romans"); assert.equal(twi[0].reference.bookName, "Romafoɔ");
  assert.ok(english[0].verseText); assert.ok(twi[0].verseText);
});

test("genealogy requires evidence and preserves explicit/inferred labels", () => {
  assert.deepEqual(validateRelationships(), []);
  assert.ok(relationships.some((item) => item.factType === "explicit"));
  assert.ok(relationships.some((item) => item.factType === "inference"));
  assert.ok(validateRelationships([{ personId: "a", relatedPersonId: "b", relationshipType: "father", factType: "explicit", evidence: [] }]).length > 0);
});

test("irrelevant passage can return no genealogy", () => {
  const context = getPassageContext({ bookId: "proverbs", chapter: 3, verseStart: 5, verseEnd: 5, language: "english" });
  assert.deepEqual(retrieveRelationships(context, "english"), []);
});

test("circular relationship traversal terminates", () => {
  const cycle = [
    { personId: "a", relatedPersonId: "b" }, { personId: "b", relatedPersonId: "a" },
  ];
  assert.deepEqual(traverseRelationships("a", cycle, 10).sort(), ["a", "b"]);
});
