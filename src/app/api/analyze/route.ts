import { NextRequest, NextResponse } from "next/server";
import {
  chunkAndStoreResume,
  generateAnalysis,
  cleanupSession,
} from "@/lib/rag";
import { randomUUID } from "crypto";
import { PDFParse } from "pdf-parse";

export async function POST(request: NextRequest) {
  const sessionId = randomUUID();

  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    if (!resume || !jobDescription?.trim()) {
      return NextResponse.json(
        { message: "Both resume and job description are required" },
        { status: 400 }
      );
    }

    // Decode base64 PDF → extract text
    const buffer = Buffer.from(resume, "base64");
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const resumeText = pdfData.text;

    console.log(`Resume text length: ${resumeText.length} chars`);

    if (!resumeText?.trim() || resumeText.length < 100) {
      return NextResponse.json(
        {
          message:
            "Could not extract text from PDF. Make sure it is not a scanned image.",
        },
        { status: 400 }
      );
    }

    // RAG Pipeline
    // 1. Semantic chunk + store
    const chunkCount = await chunkAndStoreResume(resumeText, sessionId);
    console.log(`Stored ${chunkCount} semantic chunks`);

    // 2. Multi-query retrieve + analyze
    const analysis = await generateAnalysis(jobDescription, sessionId);
    console.log(`Analysis complete. Score: ${analysis.matchScore}`);

    // 3. Cleanup
    await cleanupSession(sessionId);

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    await cleanupSession(sessionId).catch(() => {});
    console.error("Analysis error:", error);
    return NextResponse.json(
      { message: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
