import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getPineconeIndex } from "./pinecone";
import { getEmbeddings } from "./embeddings";
import { AnalysisResult } from "@/types";
import { analysisPrompt, searchQueryPrompt } from "./prompts";

// ============================================
// STEP 1 — SEMANTIC CHUNKING
// Split resume by section headers not character count
// ============================================

const SECTION_HEADERS = [
  "SKILLS",
  "SKILL",
  "TECHNICAL SKILLS",
  "EXPERIENCE",
  "WORK EXPERIENCE",
  "EMPLOYMENT",
  "PROJECTS",
  "PROJECT",
  "EDUCATION",
  "ACADEMIC",
  "CERTIFICATIONS",
  "ACHIEVEMENTS",
  "SUMMARY",
  "OBJECTIVE",
  "ABOUT",
];

export const semanticChunkResume = (resumeText: string): Document[] => {
  const lines = resumeText.split("\n");
  const sections: { header: string; content: string[] }[] = [];
  let currentSection = { header: "GENERAL", content: [] as string[] };

  for (const line of lines) {
    const trimmed = line.trim().toUpperCase();

    // Check if line is a section header
    const isHeader = SECTION_HEADERS.some(
      (header) =>
        trimmed === header ||
        trimmed.startsWith(header + ":") ||
        trimmed.startsWith(header + " "),
    );
    if (isHeader && trimmed.length < 40) {
      //save previous section if it has content
      if (currentSection.content.join("").trim().length > 0) {
        sections.push({ ...currentSection });
      }
      //start new section
      currentSection = { header: line.trim(), content: [] };
    } else {
      currentSection.content.push(line);
    }
  }
  //push last section
  if (currentSection.content.join("").trim().length > 0) {
    sections.push(currentSection);
  }

  //convert section into langchain documents
  const docs = sections
    .filter((s) => s.content.join("").trim().length > 20)
    .map(
      (section) =>
        new Document({
          pageContent:
            `${section.header}\n${section.content.join("\n")}`.trim(),
          metadata: { section: section.header },
        }),
    );
  //Fallback, if no section found ,use simple paragraph split
  if (docs.length <= 1) {
    console.log("No sections found, falling back to paragraph split");
    const paragraphs = resumeText
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 50);

    return paragraphs.map(
      (para, idx) =>
        new Document({
          pageContent: para.trim(),
          metadata: { section: `Paragraph ${idx + 1}` },
        }),
    );
  }
  return docs;
};

// ============================================
// STEP 2 — STORE IN PINECONE
// ============================================

export const chunkAndStoreResume = async (
  resumeText: string,
  sessionId: string,
) => {
  const docs = semanticChunkResume(resumeText);

  console.log(`Created ${docs.length} semantic chunks:`);
  docs.forEach((d) =>
    console.log(` → ${d.metadata.section}: ${d.pageContent.slice(0, 50)}...`),
  );

  // Add sessionId to all chunks
  const docsWithSession = docs.map((doc) => ({
    ...doc,
    metadata: { ...doc.metadata, sessionId },
  }));

  await PineconeStore.fromDocuments(docsWithSession, getEmbeddings(), {
    pineconeIndex: getPineconeIndex(),
    namespace: sessionId,
  });

  return docs.length;
};

// ============================================
// STEP 3 - MULTI-QUERY RETRIEVAL
// Generate multiple search queries from JD
// Each query finds different relevant chunks
// ============================================

const generateSearchQueries = async (
  jobDescription: string,
): Promise<string[]> => {
  const llm = getLLM();

  const prompt = searchQueryPrompt;

  //Create a LangChain chain, 1) prompt 2)send to LLM 3)return plain string output
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  //Run the chain using JD
  const result = await chain.invoke({ jobDescription });

  try {
    const clean = result.replace(/```json|```/g, "").trim();
    const queries = JSON.parse(clean) as string[];
    // Always include original JD as one of the queries
    return [...queries, jobDescription.slice(0, 200)];
  } catch {
    // Fallback if parsing fails
    return [jobDescription];
  }
};

export const retrieveRelevantChunks = async (
  jobDescription: string,
  sessionId: string,
  topKPerQuery: number = 3,
): Promise<string[]> => {
  const vectorStore = await PineconeStore.fromExistingIndex(getEmbeddings(), {
    pineconeIndex: getPineconeIndex(),
    namespace: sessionId,
  });

  // Generate multiple search queries
  const queries = await generateSearchQueries(jobDescription);
  console.log("Search queries:", queries);

  // Run all queries in parallel
  const allResults = await Promise.all(
    queries.map((query) => vectorStore.similaritySearch(query, topKPerQuery)),
  );

  // Flatten + deduplicate by content
  const seen = new Set<string>();
  const uniqueChunks: string[] = [];

  for (const results of allResults) {
    for (const result of results) {
      if (!seen.has(result.pageContent)) {
        seen.add(result.pageContent);
        uniqueChunks.push(result.pageContent);
      }
    }
  }

  console.log(
    `Retrieved ${uniqueChunks.length} unique chunks from ${queries.length} queries`,
  );
  return uniqueChunks;
};

// ============================================
// STEP 4 — LLM HELPER
// ============================================

const getLLM = () => {
  const provider = process.env.AI_PROVIDER || "gemini";

  if (provider === "openai") {
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
    });
  }

  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    temperature: 0.3,
  });
};

// ============================================
// STEP 5 — GENERATE ANALYSIS
// ============================================

export const generateAnalysis = async (
  jobDescription: string,
  sessionId: string,
): Promise<AnalysisResult> => {
  // Multi-query retrieval
  const relevantChunks = await retrieveRelevantChunks(
    jobDescription,
    sessionId,
  );

  const context = relevantChunks.join("\n\n---\n\n");

  const llm = getLLM();

  const prompt = analysisPrompt;

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const result = await chain.invoke({
    context,
    jobDescription,
  });

  const clean = result.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as AnalysisResult;
};

// ============================================
// STEP 6 — CLEANUP
// ============================================

export const cleanupSession = async (sessionId: string) => {
  try {
    await getPineconeIndex().namespace(sessionId).deleteAll();
    console.log(`Cleaned up session ${sessionId}`);
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};
