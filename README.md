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

## 🌐 Deploy to Netlify (1-Click & Git Continuous Deployment)

This repository is pre-configured with `netlify.toml`, Netlify Functions, and SPA redirects.

### Step-by-Step Deployment:

1. **Log in to [Netlify](https://app.netlify.com/)**.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Choose **GitHub** and select your repository: **`sohancreation/kormobd`**.
4. The build settings are auto-detected from `netlify.toml`:
   - **Base directory:** *(leave blank)*
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
5. **Environment Variables**:
   Under **Site configuration** → **Environment variables**, click **Add a variable**:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSy...` *(your Gemini API key)*
6. Click **Deploy kormobd**.

Your site and serverless Gemini AI functions will be live with an automatic `https://your-site.netlify.app` URL and custom domain support!

---

## 🏗️ Architecture Overview

KormoAI runs a dual architecture:
- **Localhost Development**: Express backend (`server.ts`) with Vite dev middleware on port `3000`.
- **Netlify Cloud Hosting**: Vite static SPA distribution (`dist/`) paired with serverless Express functions (`netlify/functions/api.ts`) managing all `/api/ai/*` requests.

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
