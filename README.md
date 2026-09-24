# Kormo BD — AI-Powered Job & Recruitment Platform 🇧🇩

An intelligent employment and recruitment ecosystem for Bangladesh and global remote tech talent, powered by **Gemini 3.8 Flash** and **Google Search Grounding**.

---

## 🚀 Quick Start (Localhost)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Your Gemini API Key
Create a `.env` file in the project root (or copy from `.env.example`):
```bash
cp .env.example .env
```

Open `.env` and paste your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey):
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```

> **Note:** If `GEMINI_API_KEY` is not provided, the platform automatically runs in graceful client-side fallback mode with intelligent mock simulations.

### 3. Start the Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🏗️ Architecture Overview

KormoAI runs a full-stack architecture pairing an **Express.js** backend with **Vite + React 19** frontend:

1. **Backend Server (`server.ts`)**:
   - Runs an Express server with Vite dev middleware on port `3000`.
   - Safely loads `GEMINI_API_KEY` via `dotenv` in the Node environment.
   - Hosts secure server-side AI endpoints under `/api/ai/*`.

2. **Frontend Client (`src/services/aiService.ts`)**:
   - Calls the backend `/api/ai/*` endpoints over standard JSON HTTP requests.
   - Includes graceful client heuristics and fallbacks if offline or running without an API key.

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## ⚡ Server-Side Gemini Endpoints (`/api/ai/*`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/health` | `GET` | Verifies server connectivity & API key status |
| `/api/ai/parse-resume` | `POST` | Extracts structured profile data from text/PDF resumes |
| `/api/ai/analyze-candidate` | `POST` | Objective, unbiased candidate skill matching and scoring |
| `/api/ai/generate-job-description` | `POST` | AI job description & screening question generator |
| `/api/ai/career-assistant` | `POST` | Career AI chatbot grounded with Google Search |
| `/api/ai/search-grounding` | `POST` | Real-time salary & tech market intelligence |
| `/api/ai/skills-gap` | `POST` | Resume skill comparison against bookmarked jobs |
| `/api/ai/enhance-resume` | `POST` | STAR-format resume bullet point polishing & ATS check |
| `/api/ai/mock-interview-plan` | `POST` | Role-tailored mock interview plan generator |
| `/api/ai/evaluate-mock-interview` | `POST` | Real-time speech/answer scoring & exemplar feedback |
| `/api/ai/mock-interview-final-report` | `POST` | Executive hiring committee debrief & roadmap |
| `/api/ai/translate-job` | `POST` | Cultural translation of job listings into Bangla (বাংলা) |
| `/api/ai/cover-letter` | `POST` | Tailored cover letter synthesis (Formal, Startup, Leadership) |
| `/api/ai/batch-screen` | `POST` | Bulk resume screening (Tier 1 Shortlist, Review, Reject) |
| `/api/ai/technical-assessment` | `POST` | Generates role-specific quizzes with automated grading |
