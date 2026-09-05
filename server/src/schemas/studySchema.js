import { z } from "zod";

const factType = z.enum(["explicit", "inference", "interpretation", "disputed"]);
const reference = z.object({ bookId: z.string(), chapter: z.number().int(), verseStart: z.number().int(), verseEnd: z.number().int() });
const evidenceReferences = z.array(reference);
const evidenceStatement = z.object({ statement: z.string(), explanation: z.string(), factType, evidenceReferences });

export const studyContentSchema = z.object({
  summary: z.string(),
  immediateContext: z.object({ before: z.string(), selected: z.string(), after: z.string() }),
  genealogy: z.array(z.object({ relationshipId: z.string(), person: z.string(), relationship: z.string(), relatedPerson: z.string(), explanation: z.string(), factType, evidenceReferences })),
  people: z.array(z.object({ name: z.string(), role: z.string(), factType, evidenceReferences })),
  places: z.array(z.object({ name: z.string(), significance: z.string(), factType, evidenceReferences })),
  crossReferences: z.array(z.object({ reference, connectionType: z.enum(["parallel", "quotation", "fulfilment", "prophecy", "theme", "person", "event", "contrast"]), relevance: z.string(), factType })),
  oldNewTestamentConnections: z.array(evidenceStatement),
  prophecyAndFulfilment: z.array(evidenceStatement),
  themes: z.array(z.object({ name: z.string(), explanation: z.string(), factType })),
  historicalBackground: z.array(evidenceStatement),
  interpretiveNotes: z.array(z.object({ statement: z.string(), traditionOrView: z.string(), factType })),
  limitations: z.array(z.string()),
});
