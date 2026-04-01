import { AnalysisResult } from "@/types";
import axios from "axios";
import { useState } from "react";

export const useAnalyze = () => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (
    payload: { resumeText: string; jobDescription: string },
  ) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const res = await axios.post("/api/analyze", {
        resume: payload.resumeText,
        jobDescription: payload.jobDescription,
      });

      setData(res.data.analysis);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { analyze, reset, data, loading, error };
};
