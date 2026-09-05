import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { getPassageContext, validateSelection } from "./lib/bibleRepository.js";
import { retrieveCrossReferences } from "./lib/crossReferences.js";
import { retrieveRelationships } from "./lib/relationships.js";
import { createOpenAIStudyGenerator } from "./services/openaiStudyService.js";

export function createApp(options = {}) {
  const app = express();
  const allowedOrigins = options.allowedOrigins || (process.env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const generateStudy = options.generateStudy || createOpenAIStudyGenerator();
  const requestTimeoutMs = options.requestTimeoutMs || Number(process.env.REQUEST_TIMEOUT_MS) || 45000;
  const trustProxy = options.trustProxy ?? process.env.TRUST_PROXY;
  app.disable("x-powered-by");
  if (trustProxy === "true" || trustProxy === true) app.set("trust proxy", 1);
  else if (Number.isInteger(Number(trustProxy)) && Number(trustProxy) > 0) app.set("trust proxy", Number(trustProxy));
  app.use(cors({ origin(origin, callback) { callback(null, !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)); } }));
  app.use(express.json({ limit: options.bodyLimit || "24kb", strict: true }));
  app.use("/api", rateLimit({ windowMs: options.rateLimitWindowMs || Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000, limit: options.rateLimitMax || Number(process.env.RATE_LIMIT_MAX) || 10, standardHeaders: "draft-8", legacyHeaders: false, handler: (_request, response) => response.status(429).json({ code: "RATE_LIMITED", error: "Too many Bible study requests. Please wait and try again." }) }));

  app.get("/health", (_request, response) => response.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()) }));
  app.post("/api/bible-study", async (request, response) => {
    const validation = validateSelection(request.body);
    if (!validation.ok) return response.status(400).json({ code: "INVALID_PASSAGE", error: "Invalid Bible study selection.", details: validation.errors });
    const selection = validation.selection;
    const context = getPassageContext(selection);
    const crossReferences = retrieveCrossReferences(selection);
    const relationships = retrieveRelationships(context, selection.language);
    try {
      let timeoutId;
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => { const error = new Error("Request timed out"); error.name = "TimeoutError"; reject(error); }, requestTimeoutMs);
      });
      const study = await Promise.race([generateStudy({ selection, context, crossReferences, relationships }), timeout]).finally(() => clearTimeout(timeoutId));
      return response.json(study);
    } catch (error) {
      if (error?.code === "OPENAI_NOT_CONFIGURED") return response.status(503).json({ code: "AI_NOT_CONFIGURED", error: "Bible Study AI is not configured on this server." });
      if (error?.name === "TimeoutError" || error?.name === "AbortError") return response.status(504).json({ code: "REQUEST_TIMEOUT", error: "The Bible study request timed out. Please try again." });
      if (error?.status === 401 || error?.name === "AuthenticationError") return response.status(502).json({ code: "OPENAI_AUTHENTICATION_FAILED", error: "The AI provider rejected the server credential. Check the server configuration." });
      if (error?.status === 429 && (error?.code === "insufficient_quota" || error?.type === "insufficient_quota")) return response.status(503).json({ code: "OPENAI_QUOTA_EXCEEDED", error: "The AI service quota is unavailable. Check the server billing and usage limits." });
      if (error?.status === 429) return response.status(429).json({ code: "OPENAI_RATE_LIMITED", error: "The AI service is busy. Please wait and try again." });
      console.error("Bible study generation failed.", { name: error?.name || "Error", code: error?.code || "UNKNOWN", status: error?.status || null });
      return response.status(502).json({ code: "AI_GENERATION_FAILED", error: "The Bible study could not be generated. Please try again." });
    }
  });

  app.use((error, _request, response, _next) => {
    if (error?.type === "entity.too.large") return response.status(413).json({ error: "Request body is too large." });
    if (error instanceof SyntaxError) return response.status(400).json({ error: "Request body must contain valid JSON." });
    console.error("Unhandled server error.", { name: error?.name || "Error", code: error?.code || "UNKNOWN" });
    return response.status(500).json({ error: "An unexpected server error occurred." });
  });
  return app;
}
