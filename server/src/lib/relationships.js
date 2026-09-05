import { createRequire } from "node:module";
import { hydrateReference, normalizeReference } from "./bibleRepository.js";

const require = createRequire(import.meta.url);
const relationships = require("../data/bibleRelationships.json");

export function validateRelationships(items = relationships) {
  const errors = [];
  items.forEach((item, index) => {
    if (!item.personId || !item.relatedPersonId || !item.relationshipType) errors.push(`Relationship ${index} is missing identity fields.`);
    if (!["explicit", "inference", "disputed"].includes(item.factType)) errors.push(`Relationship ${index} has an invalid factType.`);
    if (!Array.isArray(item.evidence) || item.evidence.length === 0) errors.push(`Relationship ${index} has no evidence.`);
    else item.evidence.forEach((reference) => { if (!normalizeReference(reference)) errors.push(`Relationship ${index} has invalid evidence.`); });
  });
  return errors;
}

export function retrieveRelationships(context, language) {
  const haystack = [context.before?.verseText, context.selected?.verseText, context.after?.verseText].filter(Boolean).join(" ").toLocaleLowerCase();
  const mentions = (alias) => {
    const escaped = alias.toLocaleLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, "u").test(haystack);
  };
  return relationships.filter((item) => [...item.aliases, ...Object.values(item.displayNames), ...Object.values(item.relatedDisplayNames)].some(mentions))
    .map((item) => ({ ...item, person: item.displayNames[language], relatedPerson: item.relatedDisplayNames[language], evidenceReferences: item.evidence.map((ref) => hydrateReference(ref, language)) }));
}

export function traverseRelationships(startPersonId, items = relationships, maxDepth = 5) {
  const visited = new Set([startPersonId]);
  const queue = [{ id: startPersonId, depth: 0 }];
  while (queue.length) {
    const current = queue.shift();
    if (current.depth >= maxDepth) continue;
    for (const item of items) {
      if (item.personId !== current.id || visited.has(item.relatedPersonId)) continue;
      visited.add(item.relatedPersonId);
      queue.push({ id: item.relatedPersonId, depth: current.depth + 1 });
    }
  }
  return [...visited];
}

export { relationships };
