import { AnalysisResult } from "@/types";
import axios from "axios";
import { useState } from "react";

export const useAnalyze = () => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (
    payload: { resumeFile: File; jobDescription: string },
  ) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const formData = new FormData();
      formData.append("resume", payload.resumeFile);
      formData.append("jobDescription", payload.jobDescription);

      const res = await axios.post("/api/analyze", formData);

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
