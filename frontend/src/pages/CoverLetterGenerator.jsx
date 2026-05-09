import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, Plus, Copy, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  generateCoverLetter,
  getCoverLetters,
  deleteCoverLetter,
  getCoverLetter,
} from "../services/CoverLetterService";
import { coverLetterSchema } from "../lib/schema";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import LoaderScreen from "../components/LoaderScreen";
import { LoadingBreadcrumb } from "../components/ui/animated-loading-svg-text-shimmer";

export default function CoverLetterGenerator() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const fetchLetters = async () => {
    try {
      const response = await getCoverLetters();
      if (response.success) {
        setCoverLetters(response.data);
      }
    } catch (err) {
      console.error("Error fetching cover letters:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedLetter = async (letterId) => {
    try {
      const response = await getCoverLetter(letterId);
      if (response.success) {
        setSelectedLetter(response.data);
      }
    } catch (err) {
      console.error("Error fetching cover letter:", err);
      toast.error("Failed to fetch cover letter");
      navigate("/ai-cover-letter");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchLetters();
      if (id && id !== "new") {
        await fetchSelectedLetter(id);
      } else {
        setSelectedLetter(null);
      }
    };
    loadData();
  }, [id]);

  const onSubmit = async (data) => {
    setGenerating(true);
    try {
      const response = await generateCoverLetter(data);
      if (response.success) {
        const letter = response.data;
        if (letter._dbSaveFailed) {
          toast.warning("Cover letter generated but could not be saved to library.");
        } else {
          toast.success("Cover letter generated successfully!");
        }
        setCoverLetters([letter, ...coverLetters]);
        setSelectedLetter(letter);
        if (!letter._dbSaveFailed) {
          navigate(`/ai-cover-letter/${letter.id}`);
        }
        reset();
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (letterId) => {
    try {
      const response = await deleteCoverLetter(letterId);
      if (response.success) {
        toast.success("Cover letter deleted successfully!");
        setCoverLetters(coverLetters.filter((l) => l.id !== letterId));
        if (id === letterId) navigate("/ai-cover-letter");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete cover letter");
    }
  };

  if (loading) {
    return <LoaderScreen label="Loading cover letters..." />;
  }

  return (
    <div className="container mx-auto py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-2">
            AI Cover Letter
          </h1>
          <p className="text-white/50 font-body font-light">
            Custom tailored drafts for your dream role
          </p>
        </div>
        {!id && (
          <Button
            variant="glass-strong"
            onClick={() => navigate("/ai-cover-letter/new")}
            className="rounded-full px-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar: List of cover letters */}
        <div className="space-y-6">
          <h3 className="text-sm font-heading italic text-white/50 uppercase tracking-widest px-4">
            Your Cover Letters
          </h3>
          {coverLetters.length === 0 ? (
            <Card className="border-white/5 bg-white/2">
              <CardContent className="py-12 text-center text-white/30 font-body font-light italic">
                No cover letters yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {coverLetters.map((letter) => (
                <Card
                  key={letter.id}
                  className={`cursor-pointer transition-all border-white/5 hover:bg-white/2 group ${id === String(letter.id) ? "border-white/20 bg-white/3" : ""}`}
                  onClick={() => navigate(`/ai-cover-letter/${letter.id}`)}
                >
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-left space-y-1">
                        <CardTitle className="text-base font-heading italic text-white">
                          {letter.job_title}
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest text-white/40 font-body">
                          {letter.company_name} •{" "}
                          {format(new Date(letter.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="glass"
                            size="icon"
                            className="h-8 w-8 rounded-full text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          className="liquid-glass border-white/10 bg-black/90 backdrop-blur-2xl rounded-3xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-heading italic text-white">
                              Delete Cover Letter?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-white/50 font-body font-light">
                              This action cannot be undone. This will
                              permanently remove your generated cover letter.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-3 mt-8">
                            <AlertDialogCancel className="rounded-full font-body">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(letter.id)}
                              className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-full font-body transition-all"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Main Content: Form or Preview */}
        <div className="lg:col-span-2">
          {id === "new" ? (
            <Card className="border-white/5 bg-white/2 p-2">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-heading italic text-white">
                  Job Details
                </CardTitle>
                <CardDescription className="text-white/40 font-body">
                  Provide information about the position you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="companyName"
                        className="text-white/50 uppercase tracking-widest text-[10px] ml-4"
                      >
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="e.g. Flipkart"
                        {...register("companyName")}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-red-500 ml-4">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="jobTitle"
                        className="text-white/50 uppercase tracking-widest text-[10px] ml-4"
                      >
                        Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g. SDE II"
                        {...register("jobTitle")}
                      />
                      {errors.jobTitle && (
                        <p className="text-sm text-red-500 ml-4">
                          {errors.jobTitle.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label
                      htmlFor="jobDescription"
                      className="text-white/50 uppercase tracking-widest text-[10px] ml-4"
                    >
                      Job Description (Paste here)
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description from the listing..."
                      className="min-h-50"
                      {...register("jobDescription")}
                    />
                    {errors.jobDescription && (
                      <p className="text-sm text-red-500 ml-4">
                        {errors.jobDescription.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/ai-cover-letter")}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="glass-strong"
                      disabled={generating}
                      className="rounded-full px-8"
                    >
                      {generating ? (
                        <LoadingBreadcrumb text="Cooking" className="text-xs" white />
                      ) : (
                        "Generate Cover Letter"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : selectedLetter ? (
            <div className="space-y-6">
              <div className="flex justify-end gap-2">
                <Button
                  variant="glass"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLetter.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast.success("Copied to clipboard!");
                  }}
                  className="rounded-full"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied" : "Copy Text"}
                </Button>
                <Button
                  variant="glass"
                  onClick={() => navigate("/ai-cover-letter/new")}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Another
                </Button>
              </div>

              {selectedLetter._dbSaveFailed && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                  This cover letter was generated but could not be saved to your
                  library. Copy the text below to keep it.
                </div>
              )}

              <div className="liquid-glass rounded-2xl border border-white/10 p-2">
                <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
                  {/* Document header */}
                  <div className="border-b border-gray-200 px-8 py-6 sm:px-12">
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                      {selectedLetter.job_title || "Cover Letter"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedLetter.company_name || ""}
                    </p>
                  </div>
                  {/* Letter body */}
                  <div
                    className="px-8 py-8 sm:px-12 sm:py-10 leading-relaxed whitespace-pre-wrap font-serif text-gray-900"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "15px",
                      lineHeight: "1.75",
                      minHeight: "500px",
                    }}
                  >
                    {selectedLetter.content}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 liquid-glass rounded-3xl border border-white/5 bg-white/1">
              <div className="liquid-glass-strong p-8 rounded-full">
                <Plus className="h-12 w-12 text-white/20" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-heading italic text-white">
                  Select a cover letter
                </h3>
                <p className="text-white/40 font-body font-light">
                  Choose one from the sidebar or create a new one to get
                  started.
                </p>
              </div>
              <Button
                variant="glass-strong"
                onClick={() => navigate("/ai-cover-letter/new")}
                className="rounded-full px-12"
              >
                Create New Letter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
