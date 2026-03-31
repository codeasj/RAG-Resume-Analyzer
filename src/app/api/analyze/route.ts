import { NextRequest, NextResponse } from "next/server";
import {
  chunkAndStoreResume,
  generateAnalysis,
  cleanupSession,
} from "@/lib/rag";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const sessionId = randomUUID();
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json(
        { message: "Both resume and job description are required" },
        { status: 400 },
      );
    }

    if (resumeText.length < 100) {
      return NextResponse.json(
        { message: "Resume text is too short" },
        { status: 400 },
      );
    }

    //RAG Pipeline
    await chunkAndStoreResume(resumeText, sessionId);
    const analysis = await generateAnalysis(jobDescription, sessionId);
    await cleanupSession(sessionId);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    await cleanupSession(sessionId).catch(() => {});
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { message: "Analysis failed. Please try again" },
      { status: 500 },
    );
  }
}
