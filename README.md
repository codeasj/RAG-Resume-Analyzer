# RAG Resume Analyzer

An AI-powered resume analyzer built with a full RAG (Retrieval-Augmented Generation) pipeline. Upload your resume PDF and paste a job description — get a match score, skill gap analysis, and actionable improvement suggestions.

---

## Live Demo

- **App:** [https://rag-resume-analyzer-ashy.vercel.app/]

---

## How It Works

```
Resume PDF uploaded
      ↓
pdf-parse → extracts raw text
      ↓
Semantic Chunking → splits by resume sections (Skills, Experience, Projects, Education)
      ↓
OpenAI Embeddings → converts each chunk to 1536-dimensional vector
      ↓
Pinecone → stores vectors under unique session namespace
      ↓
Job Description pasted → Multi-Query Retrieval
      ↓
LLM generates 3 search queries from JD → each searches Pinecone in parallel
      ↓
Deduplicated chunks → injected into LangChain prompt
      ↓
Gemini / OpenAI → generates structured JSON analysis
      ↓
Session vectors deleted from Pinecone
      ↓
Result shown — score, strong points, missing skills, suggestions
```

---

## Features

- **PDF Resume Upload** — text extracted via pdf-parse, no manual copy-paste
- **Semantic Chunking** — resume split by sections (Skills, Experience, Projects, Education) not arbitrary character count — preserves meaning for better retrieval
- **Multi-Query Retrieval** — LLM generates 3 search queries from JD, each searches Pinecone in parallel, results deduplicated — higher recall than single query
- **Match Score** — 0-10 score with color coding (green/yellow/red)
- **Skill Gap Analysis** — specific missing skills from JD
- **Actionable Suggestions** — specific resume improvements, not generic advice
- **Provider Switch** — Gemini (default, free) or OpenAI via env variable
- **Session Isolation** — each analysis uses a unique Pinecone namespace
- **Auto Cleanup** — vectors deleted after analysis, nothing stored permanently

---

## Tech Stack

- **Framework:** Next.js 15 (App Router + API Routes)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **AI Orchestration:** LangChain
- **Embeddings:** OpenAI text-embedding-ada-002 (1536 dimensions)
- **Vector DB:** Pinecone (cosine similarity)
- **LLM:** Google Gemini / OpenAI GPT-4o-mini
- **PDF Parsing:** pdf-parse
- **Form Validation:** React Hook Form + Zod

---

## RAG Pipeline Detail

### 1. Semantic Chunking
```
Traditional: "...React TypeScript Mo | ngoDB Express..." ← cuts mid-word
Semantic:    "SKILLS: React, TypeScript, MongoDB..."     ← full section intact
```
Detects section headers (SKILLS, EXPERIENCE, PROJECTS, EDUCATION) using regex. Falls back to paragraph splitting if no headers detected.

### 2. Embeddings
```
"SKILLS: React, TypeScript" → [0.23, 0.87, 0.12, ...] (1536 numbers)
"Frontend Engineer needed"  → [0.24, 0.85, 0.11, ...] (similar = related)
```
Similar meaning produces similar vectors. Pinecone finds them via cosine similarity.

### 3. Multi-Query Retrieval
```
Single query:  JD → 1 search → might miss relevant sections
Multi-query:   JD → LLM generates 3 queries → parallel search → deduplicate
               Better coverage, higher recall
```

### 4. Cleanup
```
After analysis → Pinecone namespace deleted
No resume data stored permanently
Cost efficient, privacy friendly
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts        ← API route (PDF decode + RAG pipeline)
│   ├── layout.tsx
│   └── page.tsx                ← main UI
├── components/
│   ├── UploadForm.tsx           ← PDF upload + JD textarea
│   ├── AnalysisResult.tsx       ← result display
│   └── ScoreCard.tsx            ← match score with progress bar
├── hooks/
│   └── useAnalyze.ts            ← custom hook (fetch + state)
├── lib/
│   ├── pinecone.ts              ← Pinecone client (singleton)
│   ├── embeddings.ts            ← OpenAI embeddings (singleton)
│   └── rag.ts                   ← full RAG pipeline
└── types/
    └── index.ts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key (for embeddings — required regardless of LLM provider)
- Google Gemini API key OR OpenAI API key (for analysis)
- Pinecone account with an index created

### Pinecone Index Setup
Create an index with these exact settings:
```
Name:       resume-analyzer
Dimensions: 1536
Metric:     cosine
```

### 1. Clone the repo

```bash
git clone https://github.com/codeasj/rag-resume-analyzer.git
cd rag-resume-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create .env.local

```env
# Embeddings — always OpenAI (required)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=resume-analyzer

# AI Provider for analysis — switch between gemini and openai
AI_PROVIDER=gemini

# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Usage

1. Upload your resume as a PDF (max 5MB, text-based not scanned)
2. Paste the job description
3. Click **Analyze Resume**
4. Wait 10-15 seconds (chunking + embedding + retrieval + generation)
5. Review your match score, strong points, missing skills, and suggestions
6. Click **Analyze Another** to start over

---

## AI Provider Switching

Switch between Gemini (free tier) and OpenAI by changing one line:

```env
AI_PROVIDER=gemini   # default, uses Google Gemini
AI_PROVIDER=openai   # uses OpenAI GPT-4o-mini
```

Note: Embeddings always use OpenAI regardless of provider — `text-embedding-ada-002` is the industry standard for RAG pipelines.

---

## Key Implementation Highlights

- **Semantic chunking** over fixed character splitting — preserves section context for better vector similarity matching
- **Multi-query retrieval** — LLM generates parallel search queries for higher recall
- **Session namespacing** — each analysis isolated in its own Pinecone namespace, prevents data mixing
- **Singleton pattern** for Pinecone and embeddings clients — avoids connection overhead on repeated calls
- **Fallback chunking** — paragraph-based split if resume has no detectable section headers
- **Base64 PDF transfer** — file encoded client-side, decoded in API route, no multipart needed in Next.js

---

## Author

**Anuj Srivastava**
- GitHub: [@codeasj](https://github.com/codeasj)
- LinkedIn: [anujsrivastava0](https://linkedin.com/in/anujsrivastava0)