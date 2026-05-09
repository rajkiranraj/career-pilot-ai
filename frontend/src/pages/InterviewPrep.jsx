import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  generateQuiz,
  saveQuizResult,
  getAssessments,
} from "../services/InterviewService";
import { Loader2 } from "lucide-react";
import StatsCards from "../components/StatsCards";
import PerformanceChart from "../components/PerformanceChart";
import QuizList from "../components/QuizList";
import QuizResult from "../components/QuizResult";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoaderScreen from "../components/LoaderScreen";

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
  const [savingResult, setSavingResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

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

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
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
    return <LoaderScreen label="Generating your personalized quiz..." />;
  }

  // Quiz Mode
  if (isQuizMode) {
    if (resultData) {
      return (
        <div className="container mx-auto py-12">
          <Card className="max-w-3xl mx-auto">
            <QuizResult result={resultData} onStartNew={startNewQuiz} />
          </Card>
        </div>
      );
    }

    if (!quizData) {
      return (
        <div className="container mx-auto py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to test your knowledge?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This quiz contains 10 questions specific to your industry and
                skills. Take your time and choose the best answer for each
                question.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={startNewQuiz} className="w-full">
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    const question = quizData[currentQuestion];

    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              Question {currentQuestion + 1} of {quizData.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium text-left">{question.question}</p>
            <RadioGroup
              onValueChange={handleAnswer}
              value={answers[currentQuestion]}
              className="space-y-2"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="text-left cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {showExplanation && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                <p className="font-medium">Explanation:</p>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!showExplanation && (
              <Button
                onClick={() => setShowExplanation(true)}
                variant="outline"
                disabled={!answers[currentQuestion]}
              >
                Show Explanation
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion] || savingResult}
              className="ml-auto"
            >
              {savingResult && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentQuestion < quizData.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Overview Mode
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
