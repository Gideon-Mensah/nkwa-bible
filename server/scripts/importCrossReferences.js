import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChapterVerseCount, normalizeReference } from "../src/lib/bibleRepository.js";

const osisIds = ["Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam","1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job","Ps","Prov","Eccl","Song","Isa","Jer","Lam","Ezek","Dan","Hos","Joel","Amos","Obad","Jonah","Mic","Nah","Hab","Zeph","Hag","Zech","Mal","Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb","Jas","1Pet","2Pet","1John","2John","3John","Jude","Rev"];
const canonicalIds = ["genesis","exodus","leviticus","numbers","deuteronomy","joshua","judges","ruth","first_samuel","second_samuel","first_kings","second_kings","first_chronicles","second_chronicles","ezra","nehemiah","esther","job","psalms","proverbs","ecclesiastes","song_of_solomon","isaiah","jeremiah","lamentations","ezekiel","daniel","hosea","joel","amos","obadiah","jonah","micah","nahum","habakkuk","zephaniah","haggai","zechariah","malachi","matthew","mark","luke","john","acts","romans","first_corinthians","second_corinthians","galatians","ephesians","philippians","colossians","first_thessalonians","second_thessalonians","first_timothy","second_timothy","titus","philemon","hebrews","james","first_peter","second_peter","first_john","second_john","third_john","jude","revelation"];
const osisToCanonical = new Map(osisIds.map((osis, index) => [osis, canonicalIds[index]]));

function parsePoint(value) {
  const match = value.match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/);
  if (!match || !osisToCanonical.has(match[1])) throw new Error(`Malformed or unsupported OSIS reference: ${value}`);
  return { bookId: osisToCanonical.get(match[1]), chapter: Number(match[2]), verse: Number(match[3]) };
}

export function parseOsisRange(value) {
  const [startValue, endValue = startValue] = value.split("-");
  const start = parsePoint(startValue);
  const end = parsePoint(endValue);
  if (start.bookId !== end.bookId) return [];
  if (end.chapter < start.chapter || (end.chapter === start.chapter && end.verse < start.verse)) throw new Error(`Reversed range: ${value}`);
  const segments = [];
  for (let chapter = start.chapter; chapter <= end.chapter; chapter += 1) {
    const verseStart = chapter === start.chapter ? start.verse : 1;
    const verseEnd = chapter === end.chapter ? end.verse : getChapterVerseCount(start.bookId, chapter);
    const normalized = normalizeReference({ bookId: start.bookId, chapter, verseStart, verseEnd });
    if (!normalized) return [];
    segments.push(normalized);
  }
  return segments;
}

export function importCrossReferences(text) {
  const output = {};
  const dedupe = new Map();
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (!lines[0]?.startsWith("From Verse\tTo Verse\tVotes")) throw new Error("Unexpected cross-reference header.");
  for (let index = 1; index < lines.length; index += 1) {
    if (!lines[index].trim()) continue;
    const columns = lines[index].split("\t");
    if (columns.length < 3 || !/^-?\d+$/.test(columns[2])) throw new Error(`Malformed row ${index + 1}.`);
    const sources = parseOsisRange(columns[0]);
    const targets = parseOsisRange(columns[1]);
    if (sources.length === 0 || targets.length === 0) continue;
    const votes = Number(columns[2]);
    for (const source of sources) for (let sourceVerse = source.verseStart; sourceVerse <= source.verseEnd; sourceVerse += 1) for (const target of targets) {
        const sourceKey = `${source.bookId}.${source.chapter}.${sourceVerse}`;
        const targetKey = `${target.bookId}.${target.chapter}.${target.verseStart}.${target.verseEnd}`;
        const dedupeKey = `${sourceKey}>${targetKey}`;
        if ((dedupe.get(dedupeKey) || -Infinity) >= votes) continue;
        dedupe.set(dedupeKey, votes);
      }
  }
  for (const [key, votes] of dedupe) {
    const [sourceKey, targetKey] = key.split(">");
    const [bookId, chapter, verseStart, verseEnd] = targetKey.split(".");
    (output[sourceKey] ||= []).push([bookId, Number(chapter), Number(verseStart), Number(verseEnd), votes]);
  }
  for (const targets of Object.values(output)) targets.sort((a, b) => b[4] - a[4]);
  return output;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error("Usage: npm run import:cross-references -- /path/to/cross_references.txt");
  const outputPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/crossReferences.json");
  const data = importCrossReferences(fs.readFileSync(path.resolve(inputPath), "utf8"));
  fs.writeFileSync(outputPath, JSON.stringify(data));
  console.log(`Wrote ${Object.keys(data).length} indexed source verses to ${outputPath}.`);
}
