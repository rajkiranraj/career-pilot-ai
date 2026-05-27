import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, Plus, Copy, Check, Download, Briefcase, FileText, Sparkles, PencilLine, Loader2 } from "lucide-react";
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
  updateCoverLetter,
} from "../services/CoverLetterService";
import { coverLetterSchema } from "../lib/schema";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import LoaderScreen from "../components/LoaderScreen";
import { LoadingBreadcrumb } from "../components/ui/animated-loading-svg-text-shimmer";
import { AILoader } from "../components/ui/ai-loader";
import Markdown from "react-markdown";
import "../styles/coverLetter.css";

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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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
      setIsEditing(false);
      setEditContent("");
    };
    loadData();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!selectedLetter || !editContent.trim()) return;
    setSavingEdit(true);
    try {
      const response = await updateCoverLetter(selectedLetter.id, editContent);
      if (response.success) {
        toast.success("Cover letter updated successfully!");
        const updatedLetter = { ...selectedLetter, content: editContent };
        setSelectedLetter(updatedLetter);
        setCoverLetters(coverLetters.map(l => l.id === selectedLetter.id ? updatedLetter : l));
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update cover letter");
    } finally {
      setSavingEdit(false);
    }
  };

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

  const handleDownloadPDF = () => {
    if (!selectedLetter) {
      toast.error("No cover letter selected");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to download PDF");
      return;
    }

    const content = selectedLetter.content || "";
    // Simple MD-to-HTML transform for print preview
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*$)/gm, '<h3 style="margin:18px 0 8px;font-size:14px;font-weight:700;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="margin:20px 0 10px;font-size:16px;font-weight:700;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="margin:24px 0 12px;font-size:18px;font-weight:700;">$1</h1>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">')
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    const dateStr = selectedLetter.created_at
      ? new Date(selectedLetter.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "";

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Cover Letter — ${selectedLetter.company_name || "Draft"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: letter; margin: 0.75in 1in; }
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      font-size: 11pt;
      line-height: 1.75;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      border-bottom: 2px solid #1e293b;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .header h1 {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 20pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .header .company {
      font-size: 10pt;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .header .date {
      font-size: 9pt;
      color: #94a3b8;
      margin-top: 6px;
    }
    .body p { margin-bottom: 12px; }
    .body strong { font-weight: 600; }
    .body em { font-style: italic; }
    @media print {
      body { padding: 0; }
    }
    @media screen {
      body { max-width: 700px; margin: 40px auto; padding: 40px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${selectedLetter.job_title || "Cover Letter"}</h1>
    <div class="company">${selectedLetter.company_name || ""}</div>
    ${dateStr ? `<div class="date">${dateStr}</div>` : ""}
  </div>
  <div class="body"><p>${htmlContent}</p></div>
</body>
</html>`);

    printWindow.document.close();
    // Wait for fonts to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
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
              {coverLetters.map((letter, index) => (
                <Card
                  key={letter.id}
                  className={`cl-sidebar-card cl-sidebar-item cursor-pointer group ${id === String(letter.id) ? "cl-active" : ""}`}
                  style={{ animationDelay: `${index * 80}ms` }}
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
                          className="border-white/10 bg-neutral-900/95 backdrop-blur-xl rounded-2xl sm:rounded-2xl max-w-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-semibold text-white">
                              Delete Cover Letter?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
                              This action cannot be undone. This will
                              permanently remove your generated cover letter.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2 mt-6">
                            <AlertDialogCancel className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(letter.id)}
                              className="bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all"
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

        <div className="lg:col-span-2">
          {generating ? (
            <AILoader text="Generating" className="py-24" />
          ) : id === "new" ? (
            <Card className="cl-form-card border-white/5 bg-white/2 p-2">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-heading italic text-white">
                  Job Details
                </CardTitle>
                <CardDescription className="text-white/40 font-body font-light">
                  Provide information about the position you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="companyName"
                        className="text-white/50 uppercase tracking-widest text-[10px] ml-4 font-body"
                      >
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        className="cl-input"
                        placeholder="e.g. Flipkart"
                        {...register("companyName")}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-red-500 ml-4 font-body">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="jobTitle"
                        className="text-white/50 uppercase tracking-widest text-[10px] ml-4 font-body"
                      >
                        Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        className="cl-input"
                        placeholder="e.g. SDE II"
                        {...register("jobTitle")}
                      />
                      {errors.jobTitle && (
                        <p className="text-sm text-red-500 ml-4 font-body">
                          {errors.jobTitle.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label
                      htmlFor="jobDescription"
                      className="text-white/50 uppercase tracking-widest text-[10px] ml-4 font-body"
                    >
                      Job Description (Paste here)
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description from the listing..."
                      className="cl-textarea min-h-50"
                      {...register("jobDescription")}
                    />
                    {errors.jobDescription && (
                      <p className="text-sm text-red-500 ml-4 font-body">
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
                    <button
                      type="submit"
                      disabled={generating}
                      className="cl-btn-generate"
                    >
                      <span>Generate Cover Letter</span>
                      <Sparkles className="cl-btn-generate-arrow h-4 w-4" />
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : selectedLetter ? (
            <div className="space-y-5">
              {/* Action toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{selectedLetter.job_title}</p>
                    <p className="text-[11px] text-white/40">{selectedLetter.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditContent(selectedLetter.content);
                        }}
                        className="h-9 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs px-4"
                        disabled={savingEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white border border-blue-500/50 text-xs px-5 shadow-lg shadow-blue-500/20 transition-all gap-1.5"
                        disabled={savingEdit}
                      >
                        {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        {savingEdit ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLetter.content);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          toast.success("Copied to clipboard!");
                        }}
                        className="h-9 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs gap-1.5 px-3"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditContent(selectedLetter.content);
                          setIsEditing(true);
                        }}
                        className="h-9 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs gap-1.5 px-3"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/ai-cover-letter/new")}
                        className="h-9 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs gap-1.5 px-3"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDownloadPDF}
                        className="h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs gap-1.5 px-4 transition-all"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {selectedLetter._dbSaveFailed && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-300/80 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  Generated but not saved — copy the text to keep it.
                </div>
              )}

              {/* Document preview */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 md:p-5">
                <div
                  id="cover-letter-preview"
                  className="bg-white rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
                  style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", colorScheme: "light" }}
                >
                  {/* Top accent gradient */}
                  <div className="h-1 bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-400" />

                  {/* Document header */}
                  <div className="px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-9" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                      <div className="space-y-1.5 text-left">
                        <h2
                          className="text-2xl sm:text-[26px] font-bold tracking-tight leading-tight"
                          style={{ fontFamily: "'Inter', sans-serif", color: "#0f172a" }}
                        >
                          {selectedLetter.job_title || "Cover Letter"}
                        </h2>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {selectedLetter.company_name || ""}
                        </p>
                      </div>
                      {selectedLetter.created_at && (
                        <div className="text-right shrink-0">
                          <p style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#cbd5e1", marginBottom: "2px" }}>
                            Date
                          </p>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>
                            {format(new Date(selectedLetter.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Letter body — rendered markdown or textarea */}
                  <div className="px-8 py-10 sm:px-12 sm:py-12 text-left">
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-full min-h-[480px] p-4 text-[14px] leading-[1.85] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                        style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
                      />
                    ) : (
                      <div
                        style={{
                          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                          minHeight: "480px",
                          color: "#334155",
                          fontSize: "14px",
                          lineHeight: "1.85",
                        }}
                      >
                        <Markdown
                          components={{
                            p: ({ children }) => <p style={{ marginBottom: "14px", color: "#334155" }}>{children}</p>,
                            strong: ({ children }) => <strong style={{ color: "#0f172a", fontWeight: 600 }}>{children}</strong>,
                            em: ({ children }) => <em style={{ color: "#475569" }}>{children}</em>,
                            h1: ({ children }) => <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "12px", marginTop: "20px" }}>{children}</h1>,
                            h2: ({ children }) => <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "10px", marginTop: "18px" }}>{children}</h2>,
                            h3: ({ children }) => <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b", marginBottom: "8px", marginTop: "16px" }}>{children}</h3>,
                            hr: () => <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />,
                            ul: ({ children }) => <ul style={{ paddingLeft: "20px", marginBottom: "14px", color: "#334155", listStyleType: "disc" }}>{children}</ul>,
                            ol: ({ children }) => <ol style={{ paddingLeft: "20px", marginBottom: "14px", color: "#334155", listStyleType: "decimal" }}>{children}</ol>,
                            li: ({ children }) => <li style={{ marginBottom: "4px", color: "#334155", display: "list-item" }}>{children}</li>,
                          }}
                        >
                          {selectedLetter.content}
                        </Markdown>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ height: "4px", background: "linear-gradient(to right, #f1f5f9, #e2e8f0, #f1f5f9)" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 space-y-8 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/[0.08] flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-white/20" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
                  <Plus className="h-3 w-3 text-white/60" />
                </div>
              </div>
              <div className="text-center space-y-2 max-w-xs">
                <h3 className="text-xl font-heading italic text-white">
                  Select a cover letter
                </h3>
                <p className="text-white/35 font-body font-light text-sm leading-relaxed">
                  Choose from your library or create a new one tailored to your next role.
                </p>
              </div>
              <Button
                onClick={() => navigate("/ai-cover-letter/new")}
                className="h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-sm px-8 transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create New Letter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
