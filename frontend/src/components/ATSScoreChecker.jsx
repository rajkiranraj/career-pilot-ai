import { useState, useCallback } from "react";
import { calculateATSScore, getScoreLabel } from "../utils/atsScorer";
import { Button } from "./ui/button";
import { LoadingBreadcrumb } from "./ui/animated-loading-svg-text-shimmer";
import "../styles/resumePreview.css";

const ICON_MAP = { success: "✅", warning: "⚠️", error: "❌" };

function ScoreCircle({ score, color }) {
  const r = 50, c = 2 * Math.PI * r, offset = c - (score / 100) * c;
  return (
    <div className="ats-score-circle">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div className="ats-score-number">
        <span className="ats-score-value" style={{ color }}>{score}</span>
        <span className="ats-score-max">/ 100</span>
      </div>
    </div>
  );
}

export default function ATSScoreChecker({ contact, summary, skills, experiences, educations, projects, certifications, achievements, onFixWithAI, fixLoading }) {
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const runCheck = useCallback(() => {
    const data = { contact, summary, skills, experiences, educations, projects, certifications, achievements };
    return calculateATSScore(data);
  }, [contact, summary, skills, experiences, educations, projects, certifications, achievements]);

  const handleCheck = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      setResult(runCheck());
      setIsCalculating(false);
    }, 400);
  }, [runCheck]);

  // Auto-recalculate after fix completes (fixLoading goes from true → false)
  const [prevFixLoading, setPrevFixLoading] = useState(fixLoading);
  if (prevFixLoading === true && fixLoading === false) {
    setPrevFixLoading(false);
    setTimeout(() => setResult(runCheck()), 300);
  }
  if (prevFixLoading !== fixLoading && fixLoading !== false) {
    setPrevFixLoading(fixLoading);
  }

  const scoreInfo = result ? getScoreLabel(result.score) : null;
  const errors = result?.suggestions.filter(s => s.type === "error") || [];
  const warnings = result?.suggestions.filter(s => s.type === "warning") || [];
  const successes = result?.suggestions.filter(s => s.type === "success") || [];
  const improvements = [...errors, ...warnings].filter(s => s.detail);
  const hasIssues = errors.length > 0 || warnings.length > 0;

  return (
    <div style={{ marginTop: "24px" }}>
      <Button variant="glass-strong" className="rounded-full w-full py-6 text-base"
        onClick={handleCheck} disabled={isCalculating} id="ats-score-button">
        {isCalculating ? (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "18px" }}>⚙️</span>
            Analyzing Resume...
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>Check ATS Score</span>
        )}
      </Button>

      {result && (
        <div className="ats-panel liquid-glass" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="ats-panel-header">
            <span style={{ fontSize: "20px" }}>📊</span>
            <span className="ats-panel-title">ATS Compatibility Score</span>
          </div>

          <ScoreCircle score={result.score} color={scoreInfo.color} />

          <div className="ats-score-label" style={{ color: scoreInfo.color }}>
            {scoreInfo.emoji} {scoreInfo.label}
          </div>

          <div className="ats-progress-bar">
            <div className="ats-progress-fill" style={{ width: `${result.score}%`, backgroundColor: scoreInfo.color }} />
          </div>

          <div className="ats-breakdown">
            {result.breakdown.map((cat, i) => (
              <div key={i} className="ats-breakdown-item">
                <div className="ats-breakdown-name">{cat.name}</div>
                <div className="ats-breakdown-score" style={{ color: cat.score >= cat.maxPoints * 0.7 ? "#22c55e" : cat.score >= cat.maxPoints * 0.4 ? "#eab308" : "#ef4444" }}>
                  {cat.score}/{cat.maxPoints}
                </div>
              </div>
            ))}
          </div>

          <ul className="ats-suggestions">
            {successes.map((s, i) => (
              <li key={`s${i}`} className="ats-suggestion-item">
                <span className="ats-suggestion-icon">{ICON_MAP.success}</span>
                <div>
                  <div className="ats-suggestion-msg">{s.message}</div>
                  {s.detail && <div className="ats-suggestion-detail">{s.detail}</div>}
                </div>
              </li>
            ))}
            {warnings.map((s, i) => (
              <li key={`w${i}`} className="ats-suggestion-item">
                <span className="ats-suggestion-icon">{ICON_MAP.warning}</span>
                <div>
                  <div className="ats-suggestion-msg">{s.message}</div>
                  {s.detail && <div className="ats-suggestion-detail">{s.detail}</div>}
                </div>
              </li>
            ))}
            {errors.map((s, i) => (
              <li key={`e${i}`} className="ats-suggestion-item">
                <span className="ats-suggestion-icon">{ICON_MAP.error}</span>
                <div>
                  <div className="ats-suggestion-msg">{s.message}</div>
                  {s.detail && <div className="ats-suggestion-detail">{s.detail}</div>}
                </div>
              </li>
            ))}
          </ul>

          {improvements.length > 0 && (
            <>
              <div className="ats-improve-title">Suggestions to Improve</div>
              <ol style={{ paddingLeft: "20px", margin: 0 }}>
                {improvements.slice(0, 6).map((s, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "6px", lineHeight: 1.5 }}>
                    {s.detail}
                  </li>
                ))}
              </ol>
            </>
          )}

          {hasIssues && onFixWithAI && (
            <div style={{ marginTop: "20px" }}>
              <Button variant="glass-strong" className="rounded-full w-full py-5 text-sm"
                onClick={onFixWithAI} disabled={fixLoading === true} id="ats-fix-button">
                {fixLoading === true ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <LoadingBreadcrumb text="Cooking" className="text-sm" white />
                  </span>
                ) : fixLoading === "error" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171" }}>🔧 Retry Fix with AI</span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>🔧 Fix with AI</span>
                )}
              </Button>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: "8px" }}>
                AI will improve your resume based on the suggestions above
              </p>
            </div>
          )}

          <div style={{ marginTop: "16px", fontSize: "11px", color: "rgba(255,255,255,0.4)", textAlign: "right" }}>
            Word Count: {result.wordCount} {result.wordCount >= 400 && result.wordCount <= 700 ? "✓" : ""}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
