import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quiz_score,
      0,
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[assessments.length - 1]; // Assuming sorted by date asc
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0,
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="hover:bg-white/[0.02] transition-colors border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50">
            Average Score
          </CardTitle>
          <div className="liquid-glass-strong p-2 rounded-full">
            <Trophy className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="text-left">
          <div className="text-3xl font-heading italic text-white mb-1">
            {getAverageScore()}%
          </div>
          <p className="text-xs text-white/30 font-body">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      <Card className="hover:bg-white/[0.02] transition-colors border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50">
            Questions Practiced
          </CardTitle>
          <div className="liquid-glass-strong p-2 rounded-full">
            <Brain className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="text-left">
          <div className="text-3xl font-heading italic text-white mb-1">
            {getTotalQuestions()}
          </div>
          <p className="text-xs text-white/30 font-body">Total questions</p>
        </CardContent>
      </Card>

      <Card className="hover:bg-white/[0.02] transition-colors border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50">
            Latest Score
          </CardTitle>
          <div className="liquid-glass-strong p-2 rounded-full">
            <Target className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="text-left">
          <div className="text-3xl font-heading italic text-white mb-1">
            {getLatestAssessment()?.quiz_score?.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-white/30 font-body">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}
