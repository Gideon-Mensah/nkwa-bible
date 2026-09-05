const REQUEST_TIMEOUT_MS = 45000;

export class BibleStudyServiceError extends Error {
  constructor(code, message, status) { super(message); this.name = "BibleStudyServiceError"; this.code = code; this.status = status; }
}

export function getBibleStudyApiOrigin(baseUrl = process.env.EXPO_PUBLIC_BIBLE_AI_API_URL) {
  if (!baseUrl?.trim()) throw new BibleStudyServiceError("MISSING_API_URL", "Bible Study AI is not configured. Set EXPO_PUBLIC_BIBLE_AI_API_URL and restart Expo.");
  let parsedUrl;
  try { parsedUrl = new URL(baseUrl.trim()); } catch { throw new BibleStudyServiceError("INVALID_API_URL", "The Bible Study AI server URL is invalid."); }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new BibleStudyServiceError("INVALID_API_URL", "The Bible Study AI server URL is invalid.");
  return baseUrl.trim().replace(/\/+$/, "");
}

function diagnose(origin, path, status, code) {
  if (typeof __DEV__ !== "undefined" && __DEV__) console.info("Bible Study AI request", { origin: new URL(origin).origin, path, status, code });
}

function friendlyServerError(payload, status) {
  const code = payload?.code || "SERVER_ERROR";
  const messages = {
    AI_NOT_CONFIGURED: "The Bible Study AI server is running, but its OpenAI API key is not configured.",
    OPENAI_AUTHENTICATION_FAILED: "The Bible Study AI server credential was rejected. Check the server API key.",
    OPENAI_QUOTA_EXCEEDED: "The Bible Study AI quota is unavailable. Check server billing and usage limits.",
    RATE_LIMITED: "Too many Bible study requests. Please wait and try again.",
    OPENAI_RATE_LIMITED: "The AI service is busy. Please wait and try again.",
    REQUEST_TIMEOUT: "The Bible study request timed out. Please try again.",
    INVALID_PASSAGE: "That Bible passage could not be requested. Please choose it again.",
  };
  return new BibleStudyServiceError(code, messages[code] || payload?.error || "The Bible study could not be generated.", status);
}

export function validateStudyResponse(study) {
  if (!study || typeof study !== "object" || !study.reference || typeof study.passageText !== "string" || typeof study.summary !== "string") return false;
  const arrayFields = ["genealogy", "people", "places", "crossReferences", "oldNewTestamentConnections", "prophecyAndFulfilment", "themes", "historicalBackground", "interpretiveNotes", "limitations"];
  return arrayFields.every((field) => Array.isArray(study[field])) && study.immediateContext && typeof study.immediateContext === "object";
}

export function buildStudyRequest(selection) {
  const request = { selectionType: selection.selectionType, bookId: selection.bookId, chapter: Number(selection.chapter), language: selection.language };
  if (selection.selectionType !== "chapter") request.verseStart = Number(selection.verseStart);
  if (selection.selectionType === "range") request.verseEnd = Number(selection.verseEnd);
  return request;
}

export async function requestBibleStudy(selection, options = {}) {
  const baseUrl = getBibleStudyApiOrigin(options.baseUrl);
  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);
  try {
    const health = await fetchImpl(`${baseUrl}/health`, { signal: controller.signal });
    const healthPayload = await health.json().catch(() => null);
    diagnose(baseUrl, "/health", health.status, healthPayload?.code);
    if (!health.ok || healthPayload?.ok !== true) throw new BibleStudyServiceError("HEALTH_CHECK_FAILED", "The Bible Study AI server health check failed.", health.status);
    if (healthPayload.aiConfigured === false) throw new BibleStudyServiceError("AI_NOT_CONFIGURED", "The Bible Study AI server is running, but its OpenAI API key is not configured.", health.status);
    const response = await fetchImpl(`${baseUrl}/api/bible-study`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildStudyRequest(selection)), signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    diagnose(baseUrl, "/api/bible-study", response.status, payload?.code);
    if (!response.ok) throw friendlyServerError(payload, response.status);
    if (!validateStudyResponse(payload)) throw new BibleStudyServiceError("INVALID_RESPONSE", "The Bible Study AI server returned an invalid response.", response.status);
    return payload;
  } catch (error) {
    if (error?.name === "AbortError") throw new BibleStudyServiceError("REQUEST_TIMEOUT", "The Bible study request timed out. Please try again.");
    if (error instanceof TypeError) throw new BibleStudyServiceError("BACKEND_UNREACHABLE", "The Bible Study AI server could not be reached. Check your connection and confirm the backend is running.");
    throw error;
  } finally { clearTimeout(timeout); }
}
