import { useState, useCallback, useEffect, useRef } from "react";
import { generateRoadmap } from "../services/RoadmapService";
import { Button } from "../components/ui/button";
import { Sparkles, Map, BookOpen, Target, Zap, Clock, ChevronRight, ArrowRight, Brain } from "lucide-react";
import { Component as AILoader } from "../components/ui/ai-loader";
import "../styles/roadmap.css";

const TIMELINE_PRESETS = [
  { value: 1, name: "1 Month — Power Month" },
  { value: 3, name: "3 Months — Quarter Blitz" },
  { value: 6, name: "6 Months — Deep Dive" },
  { value: 12, name: "12 Months — Full Mastery" },
];

const ROLE_TIMELINE_OPTIONS = TIMELINE_PRESETS.map((p) => ({
  value: p.value,
  label: p.name,
}));
const JD_TIMELINE_OPTIONS = ROLE_TIMELINE_OPTIONS;

const LOADING_STAGES = [
  { icon: Brain, text: "Analyzing your career trajectory...", color: "#c4b5fd" },
  { icon: Target, text: "Mapping skill gaps & opportunities...", color: "#93c5fd" },
  { icon: BookOpen, text: "Curating personalized resources...", color: "#6ee7b7" },
  { icon: Zap, text: "Building your phase roadmap...", color: "#fcd34d" },
  { icon: Sparkles, text: "Finalizing your career blueprint...", color: "#f472b6" },
];

/* ── Rotating loading state UI ───────────────────────────────── */
const RoadmapLoadingCard = ({ isJDMode }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStageIdx((i) => (i + 1) % LOADING_STAGES.length);
        setVisible(true);
      }, 300);
    }, 1900);
    return () => clearInterval(interval);
  }, []);

  const stage = LOADING_STAGES[stageIdx];

  return (
    <>
      <AILoader size={180} text={isJDMode ? "Processing" : "Generating"} />
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none mt-72">
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
          <span style={{ color: stage.color }}>
            <stage.icon className="h-6 w-6 animate-pulse" />
          </span>
          <span className="text-xl font-heading italic text-white drop-shadow-lg">{stage.text}</span>
        </div>
        <p className="mt-4 text-sm text-white/50 font-body drop-shadow-md">
          This typically takes 10–30 seconds. Sit tight.
        </p>
      </div>
    </>
  );
};

/* ── Main Component ──────────────────────────────────────────── */
const AIRoadmap = () => {
  const [mode, setMode] = useState("role");
  const [currentRole, setCurrentRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [jobDescription, setJobDescription] = useState("");
  const [jdTargetRole, setJdTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isJDMode = mode === "jd";
  const buttonLabel = isJDMode ? "Generate Reviser + Roadmap" : "Generate My Roadmap";
  const timelineOptions = isJDMode ? JD_TIMELINE_OPTIONS : ROLE_TIMELINE_OPTIONS;

  const handleModeChange = useCallback((nextMode) => {
    setMode(nextMode);
    setError("");
    setResult(null);
    setLoading(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isJDMode) {
      if (!jobDescription.trim()) {
        setError("Please paste a job description.");
        return;
      }
    } else if (!currentRole.trim() || !targetRole.trim()) {
      setError("Please fill in your current role and target role.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = isJDMode
        ? {
            jobDescription: jobDescription.trim(),
            currentRole: "Candidate",
            targetRole: jdTargetRole.trim() || "Target Role",
            timelineMonths,
          }
        : {
            currentRole,
            currentSkills,
            targetRole,
            timelineMonths,
          };

      const data = await generateRoadmap(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Roadmap generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    isJDMode,
    jobDescription,
    jdTargetRole,
    currentRole,
    currentSkills,
    targetRole,
    timelineMonths,
  ]);

  return (
    <div className="roadmap-page">
      {/* Header */}
      <div className="roadmap-header animate-element">
        <div className="roadmap-header__eyebrow">
          <Sparkles size={14} />
          <span>Powered by Career Pilot AI</span>
        </div>
        <h1>AI Roadmap Generator</h1>
        <p>
          Get a hyper-personalized learning roadmap to transition into your dream role — built by AI
          in seconds.
        </p>
      </div>

      {/* Input Form */}
      <div className="roadmap-form liquid-glass animate-element animate-delay-200">
        {/* Mode Toggle */}
        <div className="roadmap-mode-toggle">
          <button
            type="button"
            className={`roadmap-mode-btn ${!isJDMode ? "roadmap-mode-btn--active" : ""}`}
            onClick={() => handleModeChange("role")}
            id="roadmap-mode-role"
          >
            <Target size={14} />
            Role Inputs
          </button>
          <button
            type="button"
            className={`roadmap-mode-btn ${isJDMode ? "roadmap-mode-btn--active" : ""}`}
            onClick={() => handleModeChange("jd")}
            id="roadmap-mode-jd"
          >
            <BookOpen size={14} />
            JD Inputs
          </button>
        </div>

        {/* Fields */}
        <div className="roadmap-form-grid">
          {isJDMode ? (
            <>
              <div className="roadmap-field full-width">
                <label className="roadmap-label">Job Description</label>
                <textarea
                  className="roadmap-textarea"
                  placeholder="Paste the job description you want to target..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  id="roadmap-jd-input"
                />
                <div className="roadmap-char-count">
                  {jobDescription.length.toLocaleString()} characters
                </div>
              </div>

              <div className="roadmap-field">
                <label className="roadmap-label">Target Role (optional)</label>
                <input
                  className="roadmap-input"
                  type="text"
                  placeholder="e.g., Full-Stack Engineer"
                  value={jdTargetRole}
                  onChange={(e) => setJdTargetRole(e.target.value)}
                  id="roadmap-target-role"
                />
                <span className="roadmap-hint">We will infer from the JD if left blank.</span>
              </div>
            </>
          ) : (
            <>
              <div className="roadmap-field">
                <label className="roadmap-label">Current Role</label>
                <input
                  className="roadmap-input"
                  type="text"
                  placeholder="e.g., Frontend Developer"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  id="roadmap-current-role"
                />
              </div>

              <div className="roadmap-field">
                <label className="roadmap-label">Target Role</label>
                <input
                  className="roadmap-input"
                  type="text"
                  placeholder="e.g., Full-Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  id="roadmap-target-role"
                />
              </div>

              <div className="roadmap-field full-width">
                <label className="roadmap-label">Current Skills (comma-separated)</label>
                <input
                  className="roadmap-input"
                  type="text"
                  placeholder="e.g., React, JavaScript, HTML, CSS, Git"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  id="roadmap-skills"
                />
              </div>
            </>
          )}

          <div className="roadmap-field">
            <label className="roadmap-label">
              <Clock size={12} />
              Timeline
            </label>
            <select
              className="roadmap-select"
              value={timelineMonths}
              onChange={(e) => setTimelineMonths(Number(e.target.value))}
              id="roadmap-timeline"
            >
              {timelineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          className="roadmap-generate-btn"
          onClick={handleGenerate}
          disabled={loading}
          id="roadmap-generate-button"
        >
          {loading ? (
            <span className="roadmap-generate-btn__inner">
              <span className="roadmap-generate-spinner" />
              Generating...
            </span>
          ) : (
            <span className="roadmap-generate-btn__inner">
              <Zap size={16} />
              {buttonLabel}
              <ArrowRight size={15} className="roadmap-generate-btn__arrow" />
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="roadmap-error">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <RoadmapLoadingCard isJDMode={isJDMode} />}

      {/* Results */}
      {result && !loading && (
        <div className="roadmap-results">
          {/* Title */}
          <div className="roadmap-results-header">
            <div className="roadmap-results-badge">
              <Sparkles size={12} />
              Your Career Blueprint
            </div>
            <h2 className="roadmap-results-title">
              {result.title || "Your Career Roadmap"}
            </h2>
          </div>

          {/* Meta Badges */}
          <div className="roadmap-meta">
            <div className="roadmap-meta-badge">
              <Clock size={13} />
              {result.totalMonths || (typeof timelineMonths === "number" ? `${timelineMonths} Months` : timelineMonths)}
            </div>
            {result.weeklyHours && (
              <div className="roadmap-meta-badge">
                <Zap size={13} />
                ~{result.weeklyHours} hrs/week
              </div>
            )}
            <div className="roadmap-meta-badge">
              <Map size={13} />
              {(result.phases || []).length} Phases
            </div>
          </div>

          {/* Quick Reviser */}
          {result.quickReviser && (
            <div className="roadmap-quick-reviser liquid-glass">
              <div className="roadmap-quick-header">
                <span>Quick Reviser</span>
                <span className="roadmap-quick-pill">JD Summary</span>
              </div>
              <div className="roadmap-quick-grid">
                <div className="roadmap-quick-card">
                  <div className="roadmap-quick-title">Top Skills</div>
                  <div className="roadmap-skills-list">
                    {(result.quickReviser.topSkills || []).map((skill, i) => (
                      <span key={i} className="roadmap-skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="roadmap-quick-card">
                  <div className="roadmap-quick-title">Key Responsibilities</div>
                  <ul className="roadmap-quick-list">
                    {(result.quickReviser.keyResponsibilities || []).map((item, i) => (
                      <li key={i}>
                        <span className="roadmap-quick-dot" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="roadmap-quick-card">
                  <div className="roadmap-quick-title">Interview Focus</div>
                  <ul className="roadmap-quick-list">
                    {(result.quickReviser.interviewFocus || []).map((item, i) => (
                      <li key={i}>
                        <span className="roadmap-quick-dot roadmap-quick-dot--purple" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="roadmap-timeline">
            {(result.phases || []).map((phase, idx) => (
              <div key={idx} className="roadmap-phase">
                <div className="roadmap-phase-index">{idx + 1}</div>
                <div className="roadmap-phase-card liquid-glass">
                  <div className="roadmap-phase-header">
                    <h3 className="roadmap-phase-name">{phase.name}</h3>
                    <span className="roadmap-phase-month">{phase.month}</span>
                  </div>

                  {phase.description && (
                    <p className="roadmap-phase-desc">{phase.description}</p>
                  )}

                  <div className="roadmap-phase-sections">
                    {phase.skills?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
                          <Zap size={11} />
                          Skills to Learn
                        </div>
                        <div className="roadmap-skills-list">
                          {phase.skills.map((skill, i) => (
                            <span key={i} className="roadmap-skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.resources?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
                          <BookOpen size={11} />
                          Resources
                        </div>
                        <div className="roadmap-resource-list">
                          {phase.resources.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="roadmap-resource"
                            >
                              <ChevronRight size={12} className="roadmap-resource__chevron" />
                              <span style={{ flex: 1 }}>{res.name}</span>
                              <span className="roadmap-resource-type">{res.type}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.milestones?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
                          <Target size={11} />
                          Milestones
                        </div>
                        <div className="roadmap-milestone-list">
                          {phase.milestones.map((m, i) => (
                            <div key={i} className="roadmap-milestone">
                              <span className="roadmap-milestone-dot" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.projects?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
                          <Map size={11} />
                          Projects
                        </div>
                        <div className="roadmap-project-list">
                          {phase.projects.map((p, i) => (
                            <div key={i} className="roadmap-project">
                              <span className="roadmap-project-icon">▸</span>
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="roadmap-tips liquid-glass">
              <div className="roadmap-tips-title">
                <Sparkles size={14} />
                Pro Tips
              </div>
              <div className="roadmap-tips-list">
                {result.tips.map((tip, i) => (
                  <div key={i} className="roadmap-tip-item">
                    <span className="roadmap-tip-icon">→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRoadmap;
