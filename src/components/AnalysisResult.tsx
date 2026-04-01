import { AnalysisResult } from "@/types";
import ScoreCard from "./ScoreCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BsCheckCircle,
  BsXCircle,
  BsLightbulb,
  BsArrowCounterclockwise,
} from "react-icons/bs";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisResultComponent({ result, onReset }: Props) {
  return (
    <div className="space-y-6">
      {/* Score */}
      <ScoreCard score={result.matchScore} />

      {/* Summary */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-slate-600 italic">
            &quot;{result.summary}&quot;
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <BsCheckCircle className="w-4 h-4" />
              Strong Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.strongPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <p className="text-sm text-slate-600">{point}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <BsXCircle className="w-4 h-4" />
              Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.missingSkills.map((skill, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                <Badge
                  variant="outline"
                  className="text-xs border-red-200 text-red-600"
                >
                  {skill}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
            <BsLightbulb className="w-4 h-4" />
            Suggestions to Improve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Analyze Another */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onReset}
      >
        <BsArrowCounterclockwise className="w-4 h-4 mr-2" />
        Analyze Another Resume
      </Button>
    </div>
  );
}