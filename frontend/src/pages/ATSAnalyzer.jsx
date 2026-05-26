import { useState, useCallback, useRef, useEffect } from "react";
import { analyzeATS } from "../services/ATSAnalyzerService";
import { Button } from "../components/ui/button";
import { LoadingBreadcrumb } from "../components/ui/animated-loading-svg-text-shimmer";
import { extractTextFromFile } from "../utils/fileParser";
import "../styles/atsAnalyzer.css";

/* ── SVG Icons ─────────────────────────────────────────── */
const UploadCloudIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

/* ── Helper components ─────────────────────────────────── */
function ScoreRing({ score, color }) {
  const r = 68,
    c = 2 * Math.PI * r,
    offset = c - (score / 100) * c;
  return (
    <div className="ats-score-ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80" cy="80" r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
        />
        <circle
          cx="80" cy="80" r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1000ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="ats-score-ring-inner">
        <span className="ats-score-ring-value" style={{ color }}>{score}</span>
        <span className="ats-score-ring-label">/ 100</span>
      </div>
    </div>
  );
}

function getScoreInfo(score) {
  if (score >= 85) return { label: "Excellent Match", color: "#22c55e" };
  if (score >= 70) return { label: "Good Match", color: "#eab308" };
  if (score >= 50) return { label: "Partial Match", color: "#f97316" };
  return { label: "Low Match", color: "#ef4444" };
}

function getBarColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

/* ── Accepted file types ───────────────────────────────── */
const ACCEPTED_TYPES = {
  "text/plain": ".txt",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};
const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_TYPES);

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

/* ── Main Component ────────────────────────────────────── */
const ATSAnalyzer = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(""); // SaaS step status
  const [resumeMode, setResumeMode] = useState("drop"); // "drop" | "paste" | "uploaded"
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  /* ── File handling ───────────────────────────────────── */
  const processFile = useCallback(async (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    
    // Accept standard formats including .docx and .rtf
    const acceptedExtensions = [".txt", ".pdf", ".docx", ".rtf"];
    if (!acceptedExtensions.includes(ext)) {
      setError("Unsupported file format. Please upload a .pdf, .docx, .rtf, or .txt file.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds the 10MB size limit.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setUploadedFile({ name: file.name, size: file.size, type: ext });
    setUploadProgress(0);
    setProcessingStep("Reading document structure...");

    try {
      // Perform 100% in-browser text extraction
      const text = await extractTextFromFile(file, (progress) => {
        setUploadProgress(Math.round(progress));
        if (progress < 30) {
          setProcessingStep("Reading file data...");
        } else if (progress < 65) {
          setProcessingStep("Extracting textual content...");
        } else if (progress < 90) {
          setProcessingStep("Cleaning tags and layouts...");
        } else {
          setProcessingStep("Formatting complete!");
        }
      });

      if (!text || text.trim().length < 40) {
        throw new Error("Could not extract readable text. Please ensure the file is not a scanned image or empty.");
      }

      setResumeText(text);
      setUploadProgress(100);
      setProcessingStep("Success!");
      
      setTimeout(() => {
        setIsProcessing(false);
        setResumeMode("uploaded");
      }, 500);
    } catch (err) {
      console.error("Text extraction failed:", err);
      setIsProcessing(false);
      setUploadProgress(0);
      setUploadedFile(null);
      setProcessingStep("");
      setError(err.message || "Failed to parse document. Please paste the text directly.");
    }
  }, []);

  /* ── Drag event handlers ─────────────────────────────── */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer?.items?.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer?.files;
    if (files?.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      processFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [processFile]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setResumeText("");
    setUploadProgress(0);
    setResumeMode("drop");
  }, []);

  /* ── Keyboard accessibility ──────────────────────────── */
  const handleDropZoneKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  /* ── Analyze handler ─────────────────────────────────── */
  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeATS(resumeText, jobDescription);
      if (data) {
        // Defensive normalization to support both local Laravel (score, matchedKeywords) and Supabase schemas
        const normalized = {
          overallScore: Number(data.overallScore ?? data.score ?? 0),
          sectionScores: data.sectionScores ?? {
            "Skills Match": Number(data.score ?? 70),
            "Experience Match": Number(data.score ?? 70),
            "Keyword Match": data.matchedKeywords?.length 
              ? Math.round((data.matchedKeywords.length / ((data.matchedKeywords.length + (data.missingKeywords?.length || 0)) || 1)) * 100) 
              : Number(data.score ?? 70),
          },
          keywordMatch: data.keywordMatch ?? {
            found: data.matchedKeywords ?? [],
            missing: data.missingKeywords ?? []
          },
          strengths: data.strengths ?? [],
          improvements: data.improvements ?? data.weaknesses ?? (data.suggestions ? data.suggestions.map(s => s.message) : []),
          tailoredSummary: data.tailoredSummary ?? (data.suggestions ? data.suggestions.map(s => s.message).join(". ") : "")
        };
        setResult(normalized);
      } else {
        setResult(null);
      }
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [resumeText, jobDescription]);

  const handleCopy = useCallback(() => {
    if (result?.tailoredSummary) {
      navigator.clipboard.writeText(result.tailoredSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const scoreInfo = result ? getScoreInfo(result.overallScore) : null;
  const sectionScores = result?.sectionScores || {};
  const sectionEntries = Object.entries(sectionScores);

  return (
    <div className="ats-analyzer-page">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="ats-analyzer-header animate-element">
        <div className="ats-header-badge animate-element animate-delay-100">
          <SparklesIcon />
          <span>AI-Powered Analysis</span>
        </div>
        <h1>ATS Score Analyzer</h1>
        <p>Upload your resume and paste a job description to see how well you match — powered by AI</p>
      </div>

      {/* ── Input Grid ──────────────────────────────────── */}
      <div className="ats-input-grid">

        {/* ── Resume Card with Drag & Drop ──────────────── */}
        <div className="ats-input-card liquid-glass animate-element animate-delay-200">
          <div className="ats-input-label">
            <FileTextIcon />
            Resume
          </div>

          {/* Mode switcher tabs */}
          <div className="ats-mode-tabs">
            <button
              className={`ats-mode-tab ${resumeMode === "drop" || resumeMode === "uploaded" ? "active" : ""}`}
              onClick={() => { if (resumeMode !== "uploaded") setResumeMode("drop"); }}
              id="ats-mode-upload"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload File
            </button>
            <button
              className={`ats-mode-tab ${resumeMode === "paste" ? "active" : ""}`}
              onClick={() => setResumeMode("paste")}
              id="ats-mode-paste"
            >
              <PenIcon />
              Paste Text
            </button>
          </div>

          {/* ── Drop Zone ────────────────────────────────── */}
          {(resumeMode === "drop") && (
            <div
              ref={dropZoneRef}
              className={`ats-dropzone ${isDragging ? "ats-dropzone--dragging" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={handleDropZoneKeyDown}
              tabIndex={0}
              role="button"
              aria-label="Upload resume file"
              id="ats-dropzone"
            >
              {/* Animated border */}
              <div className="ats-dropzone-border" />

              {/* Floating particles on drag */}
              {isDragging && (
                <div className="ats-dropzone-particles">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="ats-particle" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}

              <div className="ats-dropzone-content">
                <div className={`ats-dropzone-icon ${isDragging ? "ats-dropzone-icon--active" : ""}`}>
                  <UploadCloudIcon />
                </div>
                <div className="ats-dropzone-text">
                  <span className="ats-dropzone-title">
                    {isDragging ? "Drop your resume here" : "Drag & drop your resume"}
                  </span>
                  <span className="ats-dropzone-subtitle">
                    or <span className="ats-dropzone-browse">browse files</span> from your computer
                  </span>
                </div>
                <div className="ats-dropzone-formats">
                  <span className="ats-format-badge">.PDF</span>
                  <span className="ats-format-badge">.DOC</span>
                  <span className="ats-format-badge">.DOCX</span>
                  <span className="ats-format-badge">.TXT</span>
                </div>
                <span className="ats-dropzone-limit">Maximum file size: 5MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="ats-file-input"
              />
            </div>
          )}

          {/* ── Processing State ─────────────────────────── */}
          {isProcessing && (
            <div className="ats-upload-processing">
              <div className="ats-processing-card">
                <div className="ats-processing-icon-wrap">
                  <FileTextIcon />
                </div>
                <div className="ats-processing-info">
                  <span className="ats-processing-name">{uploadedFile?.name}</span>
                  <span className="ats-processing-size">{formatFileSize(uploadedFile?.size || 0)}</span>
                </div>
                <div className="ats-processing-bar-track">
                  <div
                    className="ats-processing-bar-fill"
                    style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  />
                </div>
                <div className="ats-processing-status-row">
                  <span className="ats-processing-step">{processingStep}</span>
                  <span className="ats-processing-percent">{Math.round(Math.min(uploadProgress, 100))}%</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Uploaded State ───────────────────────────── */}
          {resumeMode === "uploaded" && !isProcessing && uploadedFile && (
            <div className="ats-uploaded-state">
              <div className="ats-uploaded-card">
                <div className="ats-uploaded-icon-wrap">
                  <CheckCircleIcon />
                </div>
                <div className="ats-uploaded-info">
                  <span className="ats-uploaded-name">{uploadedFile.name}</span>
                  <span className="ats-uploaded-meta">
                    {formatFileSize(uploadedFile.size)} • {resumeText.split(/\s+/).filter(Boolean).length} words • {resumeText.length.toLocaleString()} characters extracted
                  </span>
                </div>
                <button className="ats-uploaded-remove" onClick={handleRemoveFile} title="Remove file">
                  <TrashIcon />
                </button>
              </div>
              {resumeText && (
                <div className="ats-uploaded-preview">
                  <div className="ats-uploaded-preview-header">
                    <span className="ats-uploaded-preview-label">Extracted Text Preview</span>
                    <span className="ats-uploaded-preview-badge">Verified Plaintext</span>
                  </div>
                  <div className="ats-uploaded-preview-text">
                    {resumeText.slice(0, 600)}{resumeText.length > 600 ? "..." : ""}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Paste Mode ───────────────────────────────── */}
          {resumeMode === "paste" && (
            <div className="ats-paste-mode">
              <textarea
                className="ats-textarea"
                placeholder="Paste your full resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                id="ats-resume-input"
              />
              <div className="ats-char-count">{resumeText.length.toLocaleString()} characters</div>
            </div>
          )}
        </div>

        {/* ── Job Description Card ──────────────────────── */}
        <div className="ats-input-card liquid-glass animate-element animate-delay-300">
          <div className="ats-input-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h6" />
            </svg>
            Job Description
          </div>
          <textarea
            className="ats-textarea"
            placeholder="Paste the job description you want to compare against..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            id="ats-jd-input"
          />
          <div className="ats-char-count">{jobDescription.length.toLocaleString()} characters</div>
        </div>
      </div>

      {/* ── Analyze Button ──────────────────────────────── */}
      <div className="animate-element animate-delay-400" style={{ maxWidth: 400, margin: "0 auto" }}>
        <Button
          variant="glass-strong"
          className="rounded-full w-full py-6 text-base"
          onClick={handleAnalyze}
          disabled={loading}
          id="ats-analyze-button"
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <LoadingBreadcrumb text="Analyzing" className="text-sm" white />
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SparklesIcon />
              Analyze ATS Compatibility
            </span>
          )}
        </Button>
      </div>

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="ats-error-banner animate-element">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────── */}
      {result && (
        <div className="ats-results">
          <div className="ats-results-grid">
            <div className="ats-score-card liquid-glass">
              <ScoreRing score={result.overallScore} color={scoreInfo.color} />
              <div className="ats-score-verdict" style={{ color: scoreInfo.color }}>
                {scoreInfo.label}
              </div>
              <div className="ats-section-bars">
                {sectionEntries.map(([name, score]) => (
                  <div key={name} className="ats-section-bar-item">
                    <span className="ats-section-bar-name">{name}</span>
                    <div className="ats-section-bar-track">
                      <div
                        className="ats-section-bar-fill"
                        style={{ width: `${score}%`, backgroundColor: getBarColor(score) }}
                      />
                    </div>
                    <span className="ats-section-bar-score" style={{ color: getBarColor(score) }}>
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ats-keywords-panel liquid-glass">
              <div className="ats-keywords-title">Keyword Analysis</div>
              {result.keywordMatch?.found?.length > 0 && (
                <div className="ats-keywords-section">
                  <div className="ats-keywords-subtitle">
                    Found in Your Resume ({result.keywordMatch.found.length})
                  </div>
                  <div className="ats-keyword-badges">
                    {result.keywordMatch.found.map((kw, i) => (
                      <span key={i} className="ats-keyword-badge found">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.keywordMatch?.missing?.length > 0 && (
                <div className="ats-keywords-section">
                  <div className="ats-keywords-subtitle">
                    Missing Keywords ({result.keywordMatch.missing.length})
                  </div>
                  <div className="ats-keyword-badges">
                    {result.keywordMatch.missing.map((kw, i) => (
                      <span key={i} className="ats-keyword-badge missing">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ats-feedback-grid">
            <div className="ats-feedback-card liquid-glass">
              <div className="ats-feedback-title" style={{ color: "#4ade80" }}>
                Strengths
              </div>
              <ul className="ats-feedback-list">
                {(result.strengths || []).map((s, i) => (
                  <li key={i}><span>{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="ats-feedback-card liquid-glass">
              <div className="ats-feedback-title" style={{ color: "#fbbf24" }}>
                Improvements
              </div>
              <ul className="ats-feedback-list">
                {(result.improvements || []).map((s, i) => (
                  <li key={i}><span>{s}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {result.tailoredSummary && (
            <div className="ats-summary-card liquid-glass">
              <div className="ats-summary-title">AI-Tailored Summary</div>
              <button className="ats-summary-copy" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <p className="ats-summary-text">{result.tailoredSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATSAnalyzer;
