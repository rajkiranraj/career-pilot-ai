import { Trophy, CheckCircle2, XCircle, Loader2, Plus, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

/* ─── Animated circular score ring ─── */
function ScoreRing({ score, size = 180, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 500);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getScoreColor = () => {
    if (score >= 80) return { stroke: "#34d399", glow: "rgba(52, 211, 153, 0.35)", label: "Excellent" };
    if (score >= 60) return { stroke: "#fbbf24", glow: "rgba(251, 191, 36, 0.35)", label: "Good" };
    return { stroke: "#f87171", glow: "rgba(248, 113, 113, 0.35)", label: "Keep Practicing" };
  };

  const colors = getScoreColor();

  return (
    <div className="relative inline-flex items-center justify-center quiz-result-enter" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[2s] ease-out"
          style={{ filter: `drop-shadow(0 0 16px ${colors.glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-heading italic text-white tabular-nums">
          {score?.toFixed(0)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-body mt-1">
          percent
        </span>
      </div>
    </div>
  );
}

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
  onGenerateMore,
  loadingMore = false,
}) {
  if (!result) return null;

  const score = result.quiz_score || 0;
  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good Progress";
    return "Keep Practicing";
  };

  const correctCount = result.questions?.filter(q => q.isCorrect).length || 0;
  const totalCount = result.questions?.length || 0;

  return (
    <div className="mx-auto space-y-10">
      {/* ─── Header & Score Ring ─── */}
      <div className="text-center space-y-8">
        <div className="quiz-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-6">
            <Trophy className="w-4 h-4 text-white/50" />
            <span className="text-xs text-white/50 font-body font-medium uppercase tracking-widest">
              Quiz Complete
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <ScoreRing score={score} />
        </div>

        <div className="space-y-2 quiz-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-2xl font-heading italic text-white">
            {getScoreLabel()}
          </h2>
          <p className="text-sm text-white/40 font-body font-light">
            You answered <span className="text-white/70 font-medium">{correctCount}</span> out of <span className="text-white/70 font-medium">{totalCount}</span> questions correctly
          </p>
        </div>

        {/* Mini stats */}
        <div className="flex items-center justify-center gap-6 quiz-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/40 font-body">{correctCount} Correct</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs text-white/40 font-body">{totalCount - correctCount} Incorrect</span>
          </div>
        </div>
      </div>

      {/* ─── Improvement Tip ─── */}
      {result.improvement_tip && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 text-left quiz-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-white/40" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-body font-medium">
              AI Insight
            </span>
          </div>
          <p className="text-white/70 font-body font-light italic leading-relaxed text-sm">
            "{result.improvement_tip}"
          </p>
        </div>
      )}

      {/* ─── Questions Review ─── */}
      <div className="space-y-5 quiz-fade-in" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center gap-3 text-left">
          <div className="w-1 h-5 rounded-full bg-white/20" />
          <h3 className="text-lg font-heading italic text-white">
            Question Review
          </h3>
        </div>

        <div className="space-y-3">
          {result.questions?.map((q, index) => (
            <details
              key={index}
              className={`ip-review-details group ${q.isCorrect ? "ip-indicator-correct" : "ip-indicator-incorrect"}`}
            >
              <summary className="ip-review-summary select-none">
                {/* Question number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center mr-4">
                  <span className="text-xs text-white/40 font-body font-medium tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Question text */}
                <p className="flex-1 text-sm font-body font-medium text-white/80 text-left leading-snug pr-4">
                  {q.question}
                </p>

                {/* Result icon */}
                {q.isCorrect ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mr-4">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mr-4">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                )}

                {/* Expand indicator chevron */}
                <svg
                  className="ip-review-summary-icon w-4 h-4 text-white/20 transition-transform duration-300 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              {/* Expanded content */}
              <div className="ip-review-content space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 text-left">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-body">
                      Your Answer
                    </p>
                    <p className={`text-sm font-body font-medium ${q.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                      {q.userAnswer}
                    </p>
                  </div>
                  {!q.isCorrect && (
                    <div className="space-y-1.5 text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-body">
                        Correct Answer
                      </p>
                      <p className="text-sm text-white font-body font-medium">{q.answer}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 space-y-2 text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-body">
                    Explanation
                  </p>
                  <p className="text-sm text-white/50 font-body font-light leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      {!hideStartNew && (
        <div className="pt-6 border-t border-white/[0.06] space-y-3 quiz-fade-in" style={{ animationDelay: "700ms" }}>
          {onGenerateMore && (
            <Button
              variant="glass-strong"
              onClick={onGenerateMore}
              disabled={loadingMore}
              className="w-full rounded-2xl py-7 group"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="font-body">Generating more questions...</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="font-body font-medium">Generate More Questions</span>
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onStartNew}
            className="w-full rounded-2xl py-7 group"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <span className="font-body font-medium">Start Fresh Quiz</span>
          </Button>
        </div>
      )}
    </div>
  );
}
