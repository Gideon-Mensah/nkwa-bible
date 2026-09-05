import { hydrateReference, normalizeReference } from "./bibleRepository.js";
import { validateAndHydrateCrossReferences } from "./crossReferences.js";

const referenceKey = (reference) => `${reference.bookId}.${reference.chapter}.${reference.verseStart}.${reference.verseEnd}`;

function hydrateEvidence(items, language, allowedEvidence) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    evidenceReferences: (item.evidenceReferences || []).map(normalizeReference).filter(Boolean).filter((ref) => allowedEvidence.has(referenceKey(ref))).map((ref) => hydrateReference(ref, language)),
  }));
}

export function buildGroundingPayload(selection, context, crossReferences, relationships) {
  return {
    selection,
    localPassageContext: context,
    retrievedCrossReferences: crossReferences.map(({ reference, votes }, index) => ({ id: `cross-${index}`, ...hydrateReference(reference, selection.language), rankingVotes: votes })),
    verifiedRelationships: relationships.map((item, index) => ({ ...item, relationshipId: `relationship-${index}` })),
  };
}

export function postProcessStudy(content, { selection, context, crossReferences, relationships }) {
  const language = selection.language;
  const allowedEvidence = new Set();
  [context.before, context.selected, context.after].filter(Boolean).forEach((item) => allowedEvidence.add(referenceKey(item)));
  crossReferences.forEach((item) => allowedEvidence.add(referenceKey(item.reference)));
  relationships.flatMap((item) => item.evidence).forEach((item) => allowedEvidence.add(referenceKey(item)));

  const allowedCrossReferences = new Set(crossReferences.map((item) => referenceKey(item.reference)));
  const verifiedCrossReferences = validateAndHydrateCrossReferences(content.crossReferences, language).filter((item) => allowedCrossReferences.has(referenceKey(item.reference)));
  const relationshipById = new Map(relationships.map((item, index) => [`relationship-${index}`, item]));
  const genealogy = content.genealogy.filter((item) => relationshipById.has(item.relationshipId)).map((item) => {
    const verified = relationshipById.get(item.relationshipId);
    return {
      person: verified.person,
      relationship: verified.relationshipType,
      relatedPerson: verified.relatedPerson,
      explanation: item.explanation,
      factType: verified.factType,
      evidenceReferences: verified.evidence.map((ref) => hydrateReference(ref, language)),
    };
  });

  return {
    reference: { bookId: context.selected.bookId, bookName: context.selected.bookName, chapter: context.selected.chapter, verseStart: context.selected.verseStart, verseEnd: context.selected.verseEnd, displayReference: context.selected.displayReference },
    passageText: context.selected.verseText,
    language,
    summary: content.summary,
    immediateContext: content.immediateContext,
    genealogy,
    people: hydrateEvidence(content.people, language, allowedEvidence),
    places: hydrateEvidence(content.places, language, allowedEvidence),
    crossReferences: verifiedCrossReferences,
    oldNewTestamentConnections: hydrateEvidence(content.oldNewTestamentConnections, language, allowedEvidence),
    prophecyAndFulfilment: hydrateEvidence(content.prophecyAndFulfilment, language, allowedEvidence),
    themes: content.themes,
    historicalBackground: hydrateEvidence(content.historicalBackground, language, allowedEvidence),
    interpretiveNotes: content.interpretiveNotes,
    limitations: content.limitations,
    generatedAt: new Date().toISOString(),
    dataVersion: "study-v1-openbible-2026-08-17",
  };
}
