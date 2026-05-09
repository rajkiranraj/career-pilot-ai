import { useState, useCallback } from "react";
import { analyzeATS } from "../services/ATSAnalyzerService";
import { Button } from "../components/ui/button";
import { LoadingBreadcrumb } from "../components/ui/animated-loading-svg-text-shimmer";
import "../styles/atsAnalyzer.css";

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

const ATSAnalyzer = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please paste both your resume and the job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeATS(resumeText, jobDescription);
      setResult(data);
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
      <div className="ats-analyzer-header animate-element">
        <h1>ATS Score Analyzer</h1>
        <p>Upload your resume and paste a job description to see how well you match — powered by AI</p>
      </div>

      {/* Input Section */}
      <div className="ats-input-grid">
        <div className="ats-input-card liquid-glass animate-element animate-delay-200">
          <div className="ats-input-label">
            Resume Text
          </div>
          <textarea
            className="ats-textarea"
            placeholder="Paste your full resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            id="ats-resume-input"
          />
          <div className="ats-char-count">{resumeText.length.toLocaleString()} characters</div>
        </div>

        <div className="ats-input-card liquid-glass animate-element animate-delay-300">
          <div className="ats-input-label">
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

      {/* Analyze Button */}
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
              Analyze ATS Compatibility
            </span>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          textAlign: "center", marginTop: 20, padding: "14px 20px",
          borderRadius: 12, background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#f87171", fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="ats-results">
          {/* Score + Keywords */}
          <div className="ats-results-grid">
            {/* Score Card */}
            <div className="ats-score-card liquid-glass">
              <ScoreRing score={result.overallScore} color={scoreInfo.color} />
              <div className="ats-score-verdict" style={{ color: scoreInfo.color }}>
                {scoreInfo.label}
              </div>

              {/* Section Bars */}
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

            {/* Keywords Panel */}
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

          {/* Strengths & Improvements */}
          <div className="ats-feedback-grid">
            <div className="ats-feedback-card liquid-glass">
              <div className="ats-feedback-title" style={{ color: "#4ade80" }}>
                Strengths
              </div>
              <ul className="ats-feedback-list">
                {(result.strengths || []).map((s, i) => (
                  <li key={i}>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ats-feedback-card liquid-glass">
              <div className="ats-feedback-title" style={{ color: "#fbbf24" }}>
                Improvements
              </div>
              <ul className="ats-feedback-list">
                {(result.improvements || []).map((s, i) => (
                  <li key={i}>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tailored Summary */}
          {result.tailoredSummary && (
            <div className="ats-summary-card liquid-glass">
              <div className="ats-summary-title">
                AI-Tailored Summary
              </div>
              <button className="ats-summary-copy" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
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
