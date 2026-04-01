export interface AnalysisResult {
  matchScore: number;
  strongPoints: string[];
  missingSkills: string[];
  suggestions: string[];
  summary: string;
}

export interface AnalyzeRequest {
  resumeText: string;   // this is base64 string 
  jobDescription: string;
}