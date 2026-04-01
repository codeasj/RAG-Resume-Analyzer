"use client";

import { useAnalyze } from "@/hooks/useAnalyze";
import UploadForm from "@/components/UploadForm";
import AnalysisResultComponent from "@/components/AnalysisResult";
import { BsBriefcase } from "react-icons/bs";

export default function Home() {
  const { analyze, data, loading, error, reset } = useAnalyze();

  const handleSubmit = (resumeFile: File, jobDescription: string) => {
    analyze({ resumeFile, jobDescription });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <BsBriefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Resume Analyzer
          </h1>
          <p className="text-slate-500 mt-2">
            Upload your resume and paste a job description — AI will score your match and suggest improvements
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
              RAG
            </span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
              Pinecone
            </span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
              LangChain
            </span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
              OpenAI
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form or Result */}
        {data ? (
          <AnalysisResultComponent
            result={data}
            onReset={reset}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <UploadForm
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Resume data is processed in memory and deleted after analysis. Nothing is stored permanently.
        </p>
      </div>
    </main>
  );
}
