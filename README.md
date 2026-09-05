# Nkwa Bible

Nkwa Bible is an Expo SDK 56 mobile Bible application with offline Asante Twi and World English Bible reading, bookmarks, notes, highlights, sermon notes, PDF sermon export, and an optional retrieval-grounded study aid called **Nkwa Bible Study AI**.

## Architecture

```text
Expo mobile app
  ├─ local Bible JSON → reading remains fully offline
  ├─ AsyncStorage → personal data + capped study cache
  └─ canonical reference only
             │ HTTPS POST /api/bible-study
             ▼
Node/Express server
  ├─ validates selection against local WEB data
  ├─ retrieves ranked, verified OpenBible.info references
  ├─ retrieves curated, evidence-backed relationships
  ├─ OpenAI Responses API + strict Structured Outputs (store: false)
  └─ revalidates and hydrates every returned reference from local Bible data
```

The mobile app never receives or contains the OpenAI API key. Bible reading, personal notes, bookmarks, highlights, sermons, and cached studies remain usable when the study server is unavailable.

## Mobile setup

Requirements: Node.js 20 or newer and the Expo development environment.

```bash
npm install
cp .env.example .env
npm run start:web
```

Set `EXPO_PUBLIC_BIBLE_AI_API_URL` to the public URL of the backend. For a physical phone, `localhost` means the phone itself; use your computer's LAN address (for example `http://192.168.1.20:8787`) during local development. This public value is only a server address and is not a secret.

Expo reads `EXPO_PUBLIC_*` variables when it starts. After creating or changing `.env`, stop Expo and start it again; use `npx expo start --clear` if a stale bundle still shows the old configuration.

## Backend setup

Create an API key in the [OpenAI API dashboard](https://platform.openai.com/api-keys). Do not paste it into chat, mobile source, Expo configuration, screenshots, or Git.

```bash
cd server
npm install
cp .env.example .env
# Edit server/.env locally and set OPENAI_API_KEY.
npm run validate:data
npm test
npm start
```

From the repository root, the equivalent backend commands are `npm run server:start` and `npm run server:dev`. The server listens on `HOST=0.0.0.0` by default so a phone on the same trusted Wi-Fi network can reach it. Keep the firewall limited to trusted/private networks.

For local development, use two terminals:

```bash
# Terminal 1
npm run server:dev

# Terminal 2
npm run start:web
```

Check `http://localhost:8787/health` before generating a study. `ok: true` means the backend is reachable; `aiConfigured: true` means a non-empty server-side key was loaded. The endpoint never returns the key. On a physical iPhone, put the Mac's current Wi-Fi IPv4 address in the root `.env`, for example `EXPO_PUBLIC_BIBLE_AI_API_URL=http://192.168.1.20:8787`, then restart Expo. The Mac and phone must be on the same network, and the firewall must allow Node on that private network.

Server environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI credential | required for generation |
| `OPENAI_MODEL` | Structured Outputs-compatible model | `gpt-5-mini` |
| `HOST` | Bind address; use all interfaces for trusted LAN testing | `0.0.0.0` |
| `PORT` | HTTP port | `8787` |
| `ALLOWED_ORIGINS` | Comma-separated browser origins; native apps generally send no Origin | empty allows all |
| `REQUEST_TIMEOUT_MS` | Server and OpenAI request deadline | `45000` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window | `60000` |
| `RATE_LIMIT_MAX` | Requests per IP per window | `10` |
| `TRUST_PROXY` | Trusted reverse-proxy hop count (`1` on many managed hosts; verify with your host) | unset |

The implementation uses the official OpenAI JavaScript SDK, the Responses API, strict Structured Outputs, and `store: false`. `gpt-5-mini` is a documented cost-conscious default; set `OPENAI_MODEL` to another model only after confirming Structured Outputs compatibility in the [official model documentation](https://developers.openai.com/api/docs/models/).

## Grounding and data

The backend derives authoritative passage text from `src/data/web_bible.json` or `src/data/bible.json`; client-supplied passage text is never accepted. Model-visible evidence contains the selected passage, a small immediate context window, retrieved verified cross-references, and verified relationships. After generation, unknown or altered cross-references are removed and all retained references receive local Bible text.

Cross-references come from the [OpenBible.info Bible Cross References dataset](https://www.openbible.info/labs/cross-references/), primarily based on the public-domain *Treasury of Scripture Knowledge* and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The committed generated index contains references and ranking votes—not ESV quotations. Full attribution and regeneration details are in `server/src/data/CROSS_REFERENCES.md`.

The genealogy file is a small curated foundation covering selected Adamic, patriarchal, royal, priestly, and Jesus-family relationships. Every entry has local-Bible evidence and an explicit/inference/disputed label. It does not claim complete Bible-wide coverage. Extend `server/src/data/bibleRelationships.json` only with verified evidence, then run `npm run validate:data`.

## Privacy and security

The mobile request sends exactly: `selectionType`, canonical `bookId`, `chapter`, optional `verseStart`/`verseEnd`, and `language`. It does not send user identity, device identifiers, sermon notes, personal notes, bookmarks, highlights, or reading history.

Controls include:

- server-only API key and ignored `.env` files;
- 24 KB JSON body limit and strict request validation;
- canonical 66-book, chapter, verse, language, and 25-verse range validation;
- per-IP rate limiting and request deadlines;
- configurable CORS origins for browser clients;
- safe client-facing errors without secrets or stack traces;
- prompt-injection-resistant instructions treating retrieved text as data;
- strict response schema plus deterministic post-generation reference verification;
- no remote response storage by default (`store: false`).

## Cache and API cost

Completed studies are cached only on the device in the separate `bibleStudyCache:v1` AsyncStorage key. Entries expire after 30 days, the cache is capped at 30 studies, language is part of the key, and schema/data-version changes invalidate old keys. Regenerate explicitly creates a new paid API request. The cache can be removed independently with `clearBibleStudyCache()`.

OpenAI API use has a financial cost. Configure server-side usage monitoring and project spend limits, keep rate limits conservative, and review model pricing before deployment. No database is required for the current stateless backend.

## Deployment

Deploy `server/` to a Node.js 20+ service such as Cloud Run, Render, Fly.io, Railway, or an equivalent HTTPS platform. Configure environment variables in the host's secret manager, restrict `ALLOWED_ORIGINS` for web use, place the service behind HTTPS/reverse-proxy controls, and point `EXPO_PUBLIC_BIBLE_AI_API_URL` at it before creating a mobile build. Never bake `OPENAI_API_KEY` into Expo/EAS variables intended for the client.

## Validation

```bash
# Mobile
npm run validate:bible
npm run test:bible-study
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android

# Server
cd server
npm run lint
npm run validate:data
npm test
```

## Manual testing

1. Start the backend with a valid server-side API key and start Expo with the backend URL.
2. From a verse, tap the sparkle action and verify a single-verse study.
3. Tap **Select passage**, choose start/end verses, and verify the 25-verse limit and Cancel action.
4. Tap **Study Chapter** and verify a full chapter request.
5. Switch English/Twi on the study screen and verify the canonical selection stays unchanged.
6. Tap a cross-reference and verify the translated book and correct chapter open.
7. Turn off the backend: cached studies should open, new studies should show the internet-required message, and normal Bible features should continue working.
8. Verify Retry, Regenerate, duplicate-tap prevention, large accessibility text, and small-screen layout.

## Known limitations

- AI explanations can be mistaken; the interface labels this as a study aid and distinguishes facts, inferences, interpretations, and disputed claims.
- Genealogy coverage is intentionally incomplete and must be expanded through reviewed evidence.
- OpenBible.info links express varying strengths of association; votes rank candidates, while the generated relevance explanation remains an AI-produced interpretation.
- A real AI generation cannot be verified without a configured OpenAI account and funded API project.
- Production deployment still requires a hosting choice, HTTPS URL, operational monitoring, and spend-limit decisions.

## Support and privacy

Support: geolumia68@gmail.com

See `Privacy.html` for the existing application privacy information. Update published privacy disclosures before production deployment to describe canonical Bible-study requests sent to the selected backend and OpenAI processing.
