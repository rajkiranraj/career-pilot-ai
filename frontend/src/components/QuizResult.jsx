import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { CardContent, CardFooter } from "./ui/card";
import { Progress } from "./ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="liquid-glass-strong p-3 rounded-full">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-heading italic text-white">
          Quiz Results
        </h1>
      </div>

      <div className="space-y-12">
        {/* Score Overview */}
        <div className="text-center space-y-4">
          <div className="text-6xl font-heading italic text-white">
            {result.quiz_score?.toFixed(0)}%
          </div>
          <Progress value={result.quiz_score} className="w-full h-1.5" />
          <p className="text-xs uppercase tracking-widest text-white/30 font-body">
            Overall Performance
          </p>
        </div>

        {/* Improvement Tip */}
        {result.improvement_tip && (
          <div className="liquid-glass p-6 rounded-2xl border border-white/5 text-left bg-white/[0.02]">
            <p className="text-xs uppercase tracking-widest text-white/40 font-body mb-2">
              Improvement Tip
            </p>
            <p className="text-white/80 font-body font-light italic leading-relaxed">
              "{result.improvement_tip}"
            </p>
          </div>
        )}

        {/* Questions Review */}
        <div className="space-y-6">
          <h3 className="text-xl font-heading italic text-white text-left">
            Question Review
          </h3>
          <div className="space-y-4">
            {result.questions?.map((q, index) => (
              <div
                key={index}
                className="liquid-glass rounded-2xl p-6 space-y-6 text-left border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-body">
                      Question 0{index + 1}
                    </span>
                    <p className="text-lg font-body font-medium text-white leading-snug">
                      {q.question}
                    </p>
                  </div>
                  {q.isCorrect ? (
                    <div className="bg-green-500/10 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </div>
                  ) : (
                    <div className="bg-red-500/10 p-2 rounded-full">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">
                      Your Answer
                    </p>
                    <p
                      className={
                        q.isCorrect ? "text-green-400" : "text-red-400"
                      }
                    >
                      {q.userAnswer}
                    </p>
                  </div>
                  {!q.isCorrect && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-white/30">
                        Correct Answer
                      </p>
                      <p className="text-white">{q.answer}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white/[0.03] p-4 rounded-xl space-y-2 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-body">
                    Explanation
                  </p>
                  <p className="text-sm text-white/60 font-body font-light leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!hideStartNew && (
        <div className="pt-8 border-t border-white/10">
          <Button
            variant="glass-strong"
            onClick={onStartNew}
            className="w-full rounded-full py-6"
          >
            Start New Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
