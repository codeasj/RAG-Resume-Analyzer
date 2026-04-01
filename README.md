# RAG Resume Analyzer

RAG Resume Analyzer is a Next.js app that compares a resume PDF against a job description and returns a match score, strong points, missing skills, and resume improvement suggestions.

The app uses semantic resume chunking, OpenAI embeddings, Pinecone retrieval, and a Gemini or OpenAI chat model for the final analysis.

## Live Demo

App: https://rag-resume-analyzer-ashy.vercel.app/

## What It Does

1. Upload a resume PDF
2. Extract text from the PDF on the server
3. Split the resume into meaningful sections such as Skills, Experience, Projects, and Education
4. Convert those sections into embeddings
5. Store them in Pinecone under a unique session namespace
6. Expand the job description into multiple search queries
7. Retrieve the most relevant resume chunks
8. Ask the LLM for a structured analysis
9. Delete the Pinecone session data after the result is returned

## Main Features

1. PDF upload with server side parsing using `pdf-parse`
2. Semantic chunking instead of fixed character splitting
3. Multi query retrieval for better recall
4. Pinecone namespacing so one analysis stays isolated from another
5. Automatic cleanup after analysis
6. Support for Gemini or OpenAI as the analysis model

## Tech Stack

Framework: Next.js 16  
Language: TypeScript  
Styling: Tailwind CSS and shadcn style UI components  
AI orchestration: LangChain  
Embeddings: OpenAI `text-embedding-ada-002`  
Vector database: Pinecone  
LLM: Gemini or OpenAI  
PDF parsing: `pdf-parse`  
Forms: React Hook Form and Zod  
HTTP client: Axios

## Project Structure

```text
src/
  app/
    api/analyze/route.ts
    layout.tsx
    page.tsx
  components/
    UploadForm.tsx
    AnalysisResult.tsx
    ScoreCard.tsx
    ui/
  hooks/
    useAnalyze.ts
  lib/
    embeddings.ts
    pinecone.ts
    prompts.ts
    rag.ts
    utils.ts
  types/
```

## How The Pipeline Works

### 1. Resume parsing

The uploaded PDF is sent as `multipart/form-data` to the API route. The server reads the uploaded file, converts it into a `Buffer`, and extracts text with `pdf-parse`.

### 2. Semantic chunking

The extracted resume text is split by likely resume section headers. If no clear sections are found, the code falls back to paragraph splitting.

### 3. Embedding and storage

Each chunk is converted into an embedding and stored in Pinecone under a unique `sessionId` namespace.

### 4. Retrieval

The job description is expanded into multiple search queries. Each query searches Pinecone in parallel, and duplicate chunks are removed before analysis.

### 5. Analysis

The retrieved chunks and the original job description are passed into a prompt template. The model returns structured JSON containing:

1. `matchScore`
2. `strongPoints`
3. `missingSkills`
4. `suggestions`
5. `summary`

### 6. Cleanup

After analysis, the session namespace is deleted from Pinecone.

## Setup

### Prerequisites

1. Node.js 20+
2. Pinecone account and API key
3. OpenAI API key for embeddings
4. Gemini API key or OpenAI API key for the final analysis model

### Pinecone index

Create a Pinecone index with these settings:

```text
Name: resume-analyzer
Dimensions: 1536
Metric: cosine
```

### Environment variables

Create `.env.local` in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=resume-analyzer

AI_PROVIDER=gemini

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Usage

1. Upload a text based PDF resume
2. Paste the target job description
3. Click `Analyze Resume`
4. Review the score and suggestions

## Notes

The current code uses OpenAI embeddings through LangChain and Pinecone for retrieval. The final analysis model can be switched between Gemini and OpenAI with the `AI_PROVIDER` environment variable.

Resume data is processed for the active session and then cleaned up after analysis. It is not meant to be stored permanently.

## Author

Anuj Srivastava  
GitHub: https://github.com/codeasj  
LinkedIn: https://linkedin.com/in/anujsrivastava0
