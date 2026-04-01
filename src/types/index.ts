export interface AnalysisResult {
  matchScore: number;
  strongPoints: string[];
  missingSkills: string[];
  suggestions: string[];
  summary: string;
}

export interface AnalyzeRequest {
  resumeText: File;  
  jobDescription: string;
}