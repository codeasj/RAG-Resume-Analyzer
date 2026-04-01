import { NextRequest, NextResponse } from "next/server";
import {
  chunkAndStoreResume,
  generateAnalysis,
  cleanupSession,
} from "@/lib/rag";
import { randomUUID } from "crypto";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const extractTextFromPdf = async (resumeFile: File) => {
  // Turn resume file into bytes (web/binary)
  const arrayBuffer = await resumeFile.arrayBuffer();
  // Convert the ArrayBuffer into a Node.js Buffer (node/binary)
  const buffer = Buffer.from(arrayBuffer);
  // Extract text from the PDF
  const pdfData = await pdfParse(buffer);
  // Return extracted text
  return pdfData.text;
};

const runRagPipeline = async (
  resumeText: string,
  jobDescription: string,
  sessionId: string,
) => {
  const chunkCount = await chunkAndStoreResume(resumeText, sessionId);
  console.log(`Stored ${chunkCount} semantic chunks`);

  const analysis = await generateAnalysis(jobDescription, sessionId);
  console.log(`Analysis complete. Score: ${analysis.matchScore}`);

  // await cleanupSession(sessionId);

  return analysis;
};

export async function POST(request: NextRequest) {
  const sessionId = randomUUID();

  try {
    const formData = await request.formData();
    const resume = formData.get("resume");
    const jobDescription = formData.get("jobDescription");

    if (
      !(resume instanceof File) ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return NextResponse.json(
        { message: "Both resume and job description are required" },
        { status: 400 },
      );
    }

    const resumeText = await extractTextFromPdf(resume);
   console.log(`Resume text length: ${resumeText.length} chars`);

    if (!resumeText?.trim() || resumeText.length < 100) {
      return NextResponse.json(
        {
          message:
            "Could not extract text from PDF. Make sure it is not a scanned image.",
        },
        { status: 400 },
      );
    }

    const analysis = await runRagPipeline(
      resumeText,
      jobDescription,
      sessionId,
    );

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    await cleanupSession(sessionId).catch(() => {});
    console.error("Analysis error:", error);
    return NextResponse.json(
      { message: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
