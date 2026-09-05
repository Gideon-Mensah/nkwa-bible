import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 8787;
const host = process.env.HOST || "0.0.0.0";
const aiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
const server = createApp().listen(port, host, () => {
  console.log(`Nkwa Bible Study AI server listening on ${host}:${port}.`);
  console.log(`OpenAI configuration: ${aiConfigured ? "configured" : "not configured"}.`);
});
server.requestTimeout = (Number(process.env.REQUEST_TIMEOUT_MS) || 45000) + 5000;
