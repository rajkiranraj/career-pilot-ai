import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import QuizResult from "./QuizResult";

export default function QuizList({ assessments }) {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <Card className="border-white/5">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <CardTitle className="text-2xl font-heading italic text-white">
                Recent Quizzes
              </CardTitle>
              <CardDescription className="text-white/40 font-body">
                Review your past quiz performance
              </CardDescription>
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate("/interview?mode=quiz")}
              className="rounded-full"
            >
              Start New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments?.length === 0 ? (
              <p className="col-span-full text-center text-white/30 py-12 font-body font-light italic">
                No quizzes taken yet.
              </p>
            ) : (
              assessments?.map((assessment, i) => (
                <Card
                  key={assessment.id}
                  className="cursor-pointer hover:bg-white/[0.02] transition-all border-white/5 hover:border-white/10 group p-2"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start w-full mb-4">
                      <CardTitle className="text-xl font-heading italic text-white">
                        Quiz {i + 1}
                      </CardTitle>
                      <div className="liquid-glass-strong px-3 py-1 rounded-full text-[10px] font-medium text-white">
                        {assessment.quiz_score?.toFixed(0)}%
                      </div>
                    </div>
                    <CardDescription className="text-[10px] uppercase tracking-widest text-white/30 font-body">
                      {format(new Date(assessment.created_at), "MMMM dd, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  {assessment.improvement_tip && (
                    <CardContent className="p-6 pt-0 text-left">
                      <p className="text-xs text-white/50 font-body font-light line-clamp-2 leading-relaxed italic">
                        "{assessment.improvement_tip}"
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto liquid-glass border-white/10 bg-black/90 backdrop-blur-2xl rounded-3xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Quiz Result</DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <QuizResult
              result={selectedQuiz}
              hideStartNew
              onStartNew={() => navigate("/interview?mode=quiz")}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
