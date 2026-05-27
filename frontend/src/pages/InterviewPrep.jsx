import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  generateQuiz,
  saveQuizResult,
  getAssessments,
} from "../services/InterviewService";
import {
  Loader2,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";

import StatsCards from "../components/StatsCards";
import PerformanceChart from "../components/PerformanceChart";
import QuizList from "../components/QuizList";
import QuizResult from "../components/QuizResult";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoaderScreen from "../components/LoaderScreen";
import { AILoader } from "../components/ui/ai-loader";
import "../styles/interviewPrep.css";



/* ─── Animated circular progress ring ─── */
function ScoreRing({ score, size = 160, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 400);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getScoreColor = () => {
    if (score >= 80) return { stroke: "#34d399", glow: "rgba(52, 211, 153, 0.4)" };
    if (score >= 60) return { stroke: "#fbbf24", glow: "rgba(251, 191, 36, 0.4)" };
    return { stroke: "#f87171", glow: "rgba(248, 113, 113, 0.4)" };
  };

  const colors = getScoreColor();

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
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
          className="transition-all duration-[1.5s] ease-out"
          style={{ filter: `drop-shadow(0 0 12px ${colors.glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-heading italic text-white tabular-nums">
          {score?.toFixed(0)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-body mt-0.5">
          percent
        </span>
      </div>
    </div>
  );
}

/* ─── Progress step indicator ─── */
function QuizProgress({ current, total, answers }) {
  return (
    <div className="flex items-center gap-1.5 w-full max-w-md mx-auto">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isAnswered = answers[i] !== null;
        const isPast = i < current;
        return (
          <div
            key={i}
            className="relative flex-1 h-1.5 rounded-full overflow-hidden transition-all duration-500"
            style={{
              background: isActive
                ? "rgba(255,255,255,0.2)"
                : isPast && isAnswered
                ? "rgba(255,255,255,0.5)"
                : "rgba(255,255,255,0.06)",
            }}
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded-full bg-white"
                style={{
                  animation: "quizProgressPulse 2s ease-in-out infinite",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Option card for each answer choice ─── */
function OptionCard({ option, index, isSelected, onSelect, disabled }) {
  const labels = ["A", "B", "C", "D", "E", "F"];
  return (
    <button
      onClick={() => onSelect(option)}
      disabled={disabled}
      className={`ip-option-card ip-option-enter ${isSelected ? "ip-selected" : ""} ${disabled ? "opacity-50" : ""}`}
      style={{ animationDelay: `${index * 80 + 200}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="ip-option-index">
          {labels[index]}
        </div>
        <span className="text-[15px] font-body font-light leading-relaxed pt-1.5 text-white/70 group-hover:text-white/90">
          {option}
        </span>
      </div>
      <div className="ip-option-dot" />
    </button>
  );
}

export default function InterviewPrep() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);
  const isQuizMode =
    new URLSearchParams(location.search).get("mode") === "quiz";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [questionTransition, setQuestionTransition] = useState(false);

  const fetchAssessments = async () => {
    try {
      const response = await getAssessments();
      if (response.success) {
        setAssessments(response.data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const startNewQuiz = async () => {
    setLoading(true);
    try {
      const response = await generateQuiz();
      if (response.success) {
        setQuizData(response.data);
        setAnswers(new Array(response.data.length).fill(null));
        setCurrentQuestion(0);
        setShowExplanation(false);
        setResultData(null);
        navigate("/interview?mode=quiz");
      }
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const generateMoreQuestions = async () => {
    setLoadingMore(true);
    try {
      const response = await generateQuiz();
      if (response.success && response.data.length > 0) {
        const newQuestions = response.data;
        const prevLength = quizData ? quizData.length : 0;
        setQuizData((prev) => [...(prev || []), ...newQuestions]);
        setAnswers((prev) => [...prev, ...new Array(newQuestions.length).fill(null)]);
        setCurrentQuestion(prevLength);
        setShowExplanation(false);
        setResultData(null);
        toast.success(`${newQuestions.length} more questions added!`);
      }
    } catch (error) {
      toast.error("Failed to generate more questions");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setQuestionTransition(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setShowExplanation(false);
        setQuestionTransition(false);
      }, 300);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    setSavingResult(true);
    try {
      const response = await saveQuizResult(quizData, answers, score);
      if (response.success) {
        setResultData(response.data);
        toast.success("Quiz completed!");
        fetchAssessments(); // Refresh list
      }
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    } finally {
      setSavingResult(false);
    }
  };

  if (initialLoading && !isQuizMode) {
    return <LoaderScreen label="Loading assessments..." />;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-24">
        <AILoader text="Analyzing" />
      </div>
    );
  }

  // ─── Quiz Mode ────────────────────────────────────────────────────
  if (isQuizMode) {

    // ─── Results Screen ─────────────────────────────
    if (resultData) {
      return (
        <div className="min-h-screen bg-background">
          {/* Ambient background glow */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-white/[0.015] blur-[100px]" />
          </div>

          <div className="relative container mx-auto max-w-4xl px-4 py-12 md:py-16">
            {/* Results card */}
            <div className="rounded-3xl liquid-glass border border-white/[0.08] overflow-hidden quiz-fade-in">
              <div className="p-8 md:p-12">
                <QuizResult
                  result={resultData}
                  onStartNew={startNewQuiz}
                  onGenerateMore={generateMoreQuestions}
                  loadingMore={loadingMore}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─── Ready / Start Screen ───────────────────────
    if (!quizData) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          {/* Ambient background glow */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[120px]" />
            <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[100px]" />
          </div>

          <div className="relative w-full max-w-lg">
            {/* Decorative top spark */}
            <div className="flex justify-center mb-8 quiz-fade-in">
              <div className="liquid-glass-strong p-5 rounded-3xl">
                <Zap className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.5))" }} />
              </div>
            </div>

            <div className="text-center space-y-4 mb-10 quiz-fade-in" style={{ animationDelay: "100ms" }}>
              <h1 className="text-4xl md:text-5xl font-heading italic text-white leading-tight">
                Ready to test<br />your knowledge?
              </h1>
              <p className="text-white/40 font-body font-light text-lg max-w-sm mx-auto leading-relaxed">
                10 questions tailored to your industry and skill set. Take your time.
              </p>
            </div>

            {/* Info badges */}
            <div className="flex items-center justify-center gap-3 mb-10 quiz-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
                <BookOpen className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs text-white/50 font-body">10 Questions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
                <Clock className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs text-white/50 font-body">~5 Minutes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
                <Sparkles className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs text-white/50 font-body">AI Powered</span>
              </div>
            </div>

            {/* Start button */}
            <div className="quiz-fade-in" style={{ animationDelay: "300ms" }}>
              <Button
                onClick={startNewQuiz}
                className="w-full rounded-2xl py-7 text-base font-body font-medium tracking-wide group"
                variant="glass-strong"
              >
                <span className="mr-3">Begin Quiz</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Back link */}
            <div className="text-center mt-6 quiz-fade-in" style={{ animationDelay: "400ms" }}>
              <button
                onClick={() => navigate("/interview")}
                className="text-xs text-white/30 font-body uppercase tracking-widest hover:text-white/60 transition-colors duration-300"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ─── Active Quiz Question Screen ────────────────
    const question = quizData[currentQuestion];
    const answeredCount = answers.filter((a) => a !== null).length;
    const isLastQuestion = currentQuestion >= quizData.length - 1;

    return (
      <div className="min-h-screen bg-background">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[120px] transition-all duration-[2s] ease-out"
            style={{
              top: `${20 + (currentQuestion * 5) % 30}%`,
              left: `${10 + (currentQuestion * 7) % 40}%`,
            }}
          />
        </div>

        <div className="relative container mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* ─── Top Bar ─── */}
          <div className="flex items-center justify-between mb-8 quiz-fade-in">
            <button
              onClick={() => navigate("/interview")}
              className="text-xs text-white/30 font-body uppercase tracking-widest hover:text-white/60 transition-colors duration-300"
            >
              ← Exit
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 font-body uppercase tracking-widest">
                {answeredCount}/{quizData.length} answered
              </span>
            </div>
          </div>

          {/* ─── Progress Bar ─── */}
          <div className="mb-10 quiz-fade-in" style={{ animationDelay: "100ms" }}>
            <QuizProgress current={currentQuestion} total={quizData.length} answers={answers} />
          </div>

          {/* ─── Question Card ─── */}
          <div
            className={`transition-all duration-300 ease-out ${
              questionTransition ? "opacity-0 translate-x-8 scale-[0.98]" : "opacity-100 translate-x-0 scale-100"
            }`}
          >
            {/* Question number badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
                <span className="text-[10px] text-white/40 font-body font-medium uppercase tracking-widest">
                  Question
                </span>
                <span className="text-xs text-white font-body font-semibold tabular-nums">
                  {String(currentQuestion + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-white/20 font-body">
                  / {String(quizData.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Question text */}
            <h2 className="text-2xl md:text-3xl font-heading italic text-white leading-snug mb-10 quiz-question-enter">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => (
                <OptionCard
                  key={`${currentQuestion}-${index}`}
                  option={option}
                  index={index}
                  isSelected={answers[currentQuestion] === option}
                  onSelect={handleAnswer}
                />
              ))}
            </div>

            {/* Explanation panel */}
            {showExplanation && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 mb-8 quiz-explanation-enter">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-white/40" />
                  <span className="text-[10px] text-white/40 font-body uppercase tracking-widest font-medium">
                    Explanation
                  </span>
                </div>
                <p className="text-sm text-white/60 font-body font-light leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              {!showExplanation ? (
                <button
                  onClick={() => setShowExplanation(true)}
                  disabled={!answers[currentQuestion]}
                  className={`
                    flex items-center gap-2 text-sm font-body transition-all duration-300
                    ${answers[currentQuestion] ? "text-white/40 hover:text-white/70 cursor-pointer" : "text-white/15 cursor-not-allowed"}
                  `}
                >
                  <Eye className="w-4 h-4" />
                  <span>Show Explanation</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowExplanation(false)}
                  className="flex items-center gap-2 text-sm font-body text-white/40 hover:text-white/70 transition-colors duration-300"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Hide</span>
                </button>
              )}

              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion] || savingResult}
                variant="glass-strong"
                className="rounded-2xl px-8 py-6 group"
              >
                {savingResult ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="font-body">Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="font-body font-medium">
                      {isLastQuestion ? "Finish Quiz" : "Next"}
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Overview Mode ──────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-2">
            Interview Preparation
          </h1>
          <p className="text-white/50 font-body font-light">
            Sharpen your skills with AI-powered mock interviews
          </p>
        </div>
        <Button
          variant="glass-strong"
          onClick={startNewQuiz}
          disabled={loading}
          className="rounded-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Start New Quiz"
          )}
        </Button>
      </div>

      <div className="space-y-12">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
