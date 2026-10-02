export function createRecordId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function passageReference(passage) {
  return `${passage.book} ${passage.chapter}${passage.verse != null ? `:${passage.verse}` : ""}`;
}

export function appendText(existing, addition) {
  return existing?.trim() ? `${existing}\n\n${addition}` : addition;
}

export function normalizeSermon(fields) {
  const result = {};
  for (const key of ["title", "preacher", "church", "date", "scripture", "notes"]) {
    result[key] = String(fields[key] ?? "").trim();
  }
  if (!result.title) throw new Error("Please enter the sermon title.");
  return result;
}

export function usesStudyColumns(width, height, fontScale = 1) {
  // A short landscape phone still uses a modal. Allow room for larger text.
  return width >= Math.max(900, 900 * Math.min(fontScale, 1.4)) && height >= 600;
}
