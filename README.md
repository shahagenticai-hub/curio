# Visory — AI Assisted Ed-Tech Platform

Generates a full course outline + curated YouTube resources from a single prompt,
using the Gemini API. MERN stack, 100% free tier.

```
Frontend (React/Vite)  →  Backend (Node/Express)  →  Gemini API (course outline)
                                    ↓                →  YouTube Data API (videos)
                             MongoDB Atlas (saves every generated course)
```

---

## 0. Prerequisites

- Node.js 18+ installed (`node -v` to check). Get it from nodejs.org if not.
- A free Google account (for Gemini + YouTube keys).
- A free MongoDB Atlas account.

Everything below is free tier — no credit card required for any of it.

---

## 1. Get your Gemini API key (2 minutes)

1. Go to https://aistudio.google.com/apikey
2. Sign in, click **"Create API key"**.
3. Copy the key — you'll paste it into `backend/.env` as `GEMINI_API_KEY`.

Free tier gives you a solid daily quota (~1,000+ requests/day depending on model)
— more than enough for a demo/portfolio project.

## 2. Get your YouTube Data API key (3 minutes)

This can be a **separate key in the same Google Cloud project** as Gemini:

1. Go to https://console.cloud.google.com/
2. Create a new project (or reuse one) — top-left project dropdown → "New Project".
3. In the search bar, search **"YouTube Data API v3"** → click it → **Enable**.
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
5. Copy the key into `backend/.env` as `YOUTUBE_API_KEY`.

Free quota: 10,000 units/day. Each search costs ~100 units, so ~100 searches/day
free — plenty for building/demoing.

## 3. Set up MongoDB Atlas (free forever, 5 minutes)

Since you're new to MongoDB, here's the exact path:

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. When asked to create a cluster, pick the **M0 Free** tier (0$/month forever).
   Choose any cloud provider/region close to you.
3. **Create a database user**: set a username + password (save these — you'll
   need them in the connection string). Under "Network Access", add
   `0.0.0.0/0` (allow access from anywhere) — fine for a dev/demo project.
4. Once the cluster is ready, click **Connect → Drivers → Node.js**. Copy the
   connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Paste it into `backend/.env` as `MONGODB_URI`, replacing `<username>` and
   `<password>` with your actual values, and add `/visory` before the `?` so
   it points at a database named `visory`:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/visory?retryWrites=true&w=majority
   ```

That's it — no local install needed, it's fully hosted and free.

---

## 4. Run the backend

```bash
cd backend
npm install
cp .env.example .env
# now open .env and paste in your 3 keys: GEMINI_API_KEY, YOUTUBE_API_KEY, MONGODB_URI
npm run dev
```

You should see:
```
[db] connected to MongoDB
[server] Visory API running on port 5000
```

Sanity check: open http://localhost:5000/api/health → should return `{"ok":true}`.

## 5. Run the frontend

In a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — type something like *"Teach me React for someone
who knows JavaScript"* and click **Generate course**. First request takes
5–15 seconds (Gemini + several YouTube searches run server-side).

---

## 6. How it actually works (for your interview / demo)

1. User submits a free-text prompt from the React form.
2. Backend sends it to Gemini with a **JSON response schema** (`geminiService.js`)
   so the model is forced to return a strict shape: `{ title, description,
   modules: [{ title, lessons: [{ title, description, searchQuery }] }] }`.
   This avoids fragile manual parsing of free-form AI text.
3. Backend takes every lesson's `searchQuery` and calls the **YouTube Data API**
   in parallel (`youtubeService.js`) to attach 3 real videos per lesson.
4. The finished course is saved to **MongoDB** (`Course` model) — this is what
   powers the "previously generated" history sidebar.
5. Frontend renders it as an accordion of modules → lessons → video cards.

Talking points if asked "why this design":
- Structured output (`responseSchema`) instead of asking Gemini for raw text
  and regex-parsing it — much more reliable.
- Resource fetching is **decoupled** from the AI call — if YouTube's API fails
  or hits quota, the course still generates, just without videos for that
  lesson (see the `try/catch` returning `[]` in `youtubeService.js`).
- Persistence layer (Mongo) turns a one-off "prompt → response" tool into an
  actual product with history/state.

---

## 7. Deploy it for free (so your CV links to a live demo)

**Backend → Render.com (free tier):**
1. Push this repo to GitHub.
2. On Render: New → Web Service → connect your repo, root directory `backend`.
3. Build command: `npm install`, Start command: `npm start`.
4. Add your 3 env vars (`GEMINI_API_KEY`, `YOUTUBE_API_KEY`, `MONGODB_URI`) plus
   `CLIENT_ORIGIN` set to your deployed frontend URL (add after step below).

**Frontend → Vercel (free tier):**
1. New Project → import the same repo, root directory `frontend`.
2. Add env var `VITE_API_BASE_URL` = your Render backend URL + `/api`.
3. Deploy. Then go back to Render and set `CLIENT_ORIGIN` to this Vercel URL.

Both free tiers can "sleep" after inactivity — mention this if a recruiter's
first load feels slow; it's expected on free hosting, not a bug.

---

## 8. Possible "future work" to mention if asked

- User accounts (JWT auth) so each learner has their own course history.
- Progress tracking per lesson (mark complete / done).
- Export course as PDF.
- Swap/augment YouTube with other ed-tech APIs (Coursera, freeCodeCamp) for
  more resource variety.

## 9. A note on the Gemini model

This uses `gemini-2.5-flash` (set in `backend/.env`), free-tier and stable as
of writing. If Google has moved on to a newer generation by the time you run
this, just change `GEMINI_MODEL` in `.env` — no code changes needed.
