import { PromptTemplate } from "@langchain/core/prompts";

export const searchQueryPrompt = PromptTemplate.fromTemplate(`
You are helping search a resume database.
Given this job description, generate 3 different search queries to find relevant resume sections.
Each query should focus on a different aspect.

Job Description:
{jobDescription}

Respond ONLY with a JSON array of 3 strings. Example:
["React and TypeScript skills", "full stack project experience", "backend API development"]

No explanation, just the JSON array.
`);

export const analysisPrompt = PromptTemplate.fromTemplate(`
You are an expert technical recruiter analyzing a developer resume against a job description.

RETRIEVED RESUME SECTIONS (most relevant to this JD):
{context}

JOB DESCRIPTION:
{jobDescription}

Analyze the match carefully and respond ONLY with valid JSON in this exact format:
{{
  "matchScore": <number 0-10>,
  "strongPoints": ["<specific point>", "<specific point>", "<specific point>"],
  "missingSkills": ["<skill>", "<skill>", "<skill>"],
  "suggestions": ["<actionable suggestion>", "<actionable suggestion>", "<actionable suggestion>"],
  "summary": "<one honest sentence about overall fit>"
}}

Rules:
- matchScore must reflect actual skill overlap, not just enthusiasm
- strongPoints must reference specific things from the resume
- missingSkills must be skills explicitly mentioned in JD but absent from resume
- suggestions must be specific and actionable, not generic
- No markdown, no explanation, just the JSON object
`);
