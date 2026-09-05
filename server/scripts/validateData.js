import { validateCanonicalData } from "../src/lib/bibleRepository.js";
import { validateCrossReferenceIndex } from "../src/lib/crossReferences.js";
import { validateRelationships } from "../src/lib/relationships.js";

const errors = [...validateCanonicalData(), ...validateCrossReferenceIndex(), ...validateRelationships()];
if (errors.length) {
  console.error(errors.slice(0, 50).join("\n"));
  if (errors.length > 50) console.error(`...and ${errors.length - 50} more errors.`);
  process.exit(1);
}
console.log("Canonical books, cross-references, and genealogy evidence are valid.");
