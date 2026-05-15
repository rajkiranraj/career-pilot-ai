import { useState, useCallback } from "react";
import { generateRoadmap } from "../services/RoadmapService";
import { Button } from "../components/ui/button";
import { LoadingBreadcrumb } from "../components/ui/animated-loading-svg-text-shimmer";
import "../styles/roadmap.css";

const TIMELINE_PRESETS = [
  { value: 3, name: "Sprint" },
  { value: 6, name: "Standard" },
  { value: 9, name: "Thorough" },
  { value: 12, name: "Deep Dive" },
];

const ROLE_TIMELINE_OPTIONS = TIMELINE_PRESETS.map((preset) => ({
  value: preset.value,
  label: `${preset.value} Months — ${preset.name}`,
}));

const HOURS_PER_MONTH = 40;

const JD_TIMELINE_OPTIONS = TIMELINE_PRESETS.map((preset) => ({
  value: preset.value,
  label: `${preset.value * HOURS_PER_MONTH} Hours — ${preset.name}`,
}));

const RESOURCE_ICONS = {
  course: "",
  book: "",
  tutorial: "",
  video: "",
  documentation: "",
};

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
  const loadingLabel = isJDMode ? "Generating Reviser + Roadmap" : "Generating Roadmap";
  const buttonLabel = isJDMode ? "Generate Reviser + Roadmap" : "Generate My Roadmap";
  const timelineOptions = isJDMode ? JD_TIMELINE_OPTIONS : ROLE_TIMELINE_OPTIONS;
  const timelineLabel = isJDMode ? "Timeline (hours)" : "Timeline";

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
            targetRole: jdTargetRole.trim() || undefined,
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
      <div className="roadmap-header animate-element">
        <h1>AI Roadmap Generator</h1>
        <p>Get a personalized learning roadmap to transition into your dream role — powered by AI</p>
      </div>

      {/* Input Form */}
      <div className="roadmap-form liquid-glass animate-element animate-delay-200">
        <div className="roadmap-mode-toggle">
          <Button
            type="button"
            size="sm"
            variant={!isJDMode ? "glass" : "outline"}
            onClick={() => handleModeChange("role")}
            aria-pressed={!isJDMode}
          >
            Role Inputs
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isJDMode ? "glass" : "outline"}
            onClick={() => handleModeChange("jd")}
            aria-pressed={isJDMode}
          >
            JD Inputs
          </Button>
        </div>
        <div className="roadmap-form-grid">
          {isJDMode ? (
            <>
              <div className="roadmap-field full-width">
                <label className="roadmap-label">
                  Job Description
                </label>
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
                <label className="roadmap-label">
                  Target Role (optional)
                </label>
                <input
                  className="roadmap-input"
                  type="text"
                  placeholder="e.g., Full-Stack Engineer"
                  value={jdTargetRole}
                  onChange={(e) => setJdTargetRole(e.target.value)}
                  id="roadmap-target-role"
                />
                <span className="roadmap-hint">We will infer from the JD if blank.</span>
              </div>
            </>
          ) : (
            <>
              <div className="roadmap-field">
                <label className="roadmap-label">
                  Current Role
                </label>
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
                <label className="roadmap-label">
                  Target Role
                </label>
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
                <label className="roadmap-label">
                  Current Skills (comma-separated)
                </label>
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
              {timelineLabel}
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

        <Button
          variant="glass-strong"
          className="rounded-full w-full py-6 text-base"
          onClick={handleGenerate}
          disabled={loading}
          id="roadmap-generate-button"
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <LoadingBreadcrumb text={loadingLabel} className="text-sm" white />
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {buttonLabel}
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
        <div className="roadmap-results">
          {/* Title */}
          <div className="roadmap-header" style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 36 }}>{result.title || "Your Career Roadmap"}</h1>
          </div>

          {/* Meta Badges */}
          <div className="roadmap-meta">
            <div className="roadmap-meta-badge liquid-glass">
              {result.totalMonths || timelineMonths} Months
            </div>
            {result.weeklyHours && (
              <div className="roadmap-meta-badge liquid-glass">
                ~{result.weeklyHours} hrs/week
              </div>
            )}
            <div className="roadmap-meta-badge liquid-glass">
              {(result.phases || []).length} Phases
            </div>
          </div>

          {result.quickReviser && (
            <div className="roadmap-quick-reviser liquid-glass">
              <div className="roadmap-quick-header">
                Quick Reviser
                <span className="roadmap-quick-pill">JD Mode</span>
              </div>
              <div className="roadmap-quick-grid">
                <div className="roadmap-quick-card">
                  <div className="roadmap-quick-title">Top Skills</div>
                  <div className="roadmap-skills-list">
                    {(result.quickReviser.topSkills || []).map((skill, i) => (
                      <span key={i} className="roadmap-skill-tag">{skill}</span>
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
                        <span className="roadmap-quick-dot" />
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
                <div className="roadmap-phase-card liquid-glass">
                  <div className="roadmap-phase-header">
                    <h3 className="roadmap-phase-name">{phase.name}</h3>
                    <span className="roadmap-phase-month">{phase.month}</span>
                  </div>

                  {phase.description && (
                    <p className="roadmap-phase-desc">{phase.description}</p>
                  )}

                  <div className="roadmap-phase-sections">
                    {/* Skills */}
                    {phase.skills?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
                          Skills to Learn
                        </div>
                        <div className="roadmap-skills-list">
                          {phase.skills.map((skill, i) => (
                            <span key={i} className="roadmap-skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {phase.resources?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
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
                              <span style={{ flex: 1 }}>{res.name}</span>
                              <span className="roadmap-resource-type">{res.type}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    {phase.milestones?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
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

                    {/* Projects */}
                    {phase.projects?.length > 0 && (
                      <div className="roadmap-phase-section">
                        <div className="roadmap-section-title">
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
