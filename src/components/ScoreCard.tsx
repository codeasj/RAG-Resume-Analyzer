interface Props {
  score: number;
}

export default function ScoreCard({ score }: Props) {
  const getColor = () => {
    if (score >= 7) return "text-green-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getBg = () => {
    if (score >= 7) return "bg-green-50 border-green-200";
    if (score >= 4) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getLabel = () => {
    if (score >= 7) return "Strong Match";
    if (score >= 4) return "Partial Match";
    return "Weak Match";
  };

  const percentage = (score / 10) * 100;

  return (
    <div className={`border rounded-xl p-6 text-center ${getBg()}`}>
      <p className="text-sm font-medium text-slate-500 mb-1">Match Score</p>
      <p className={`text-6xl font-bold ${getColor()}`}>
        {score}<span className="text-2xl text-slate-400">/10</span>
      </p>
      <p className={`text-sm font-medium mt-2 ${getColor()}`}>
        {getLabel()}
      </p>

      {/* Progress bar */}
      <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            score >= 7
              ? "bg-green-500"
              : score >= 4
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}