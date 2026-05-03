/**
 * ATS (Applicant Tracking System) Scoring Engine
 */

const ACTION_VERBS = [
  "led", "built", "designed", "implemented", "optimized", "developed",
  "managed", "delivered", "increased", "reduced", "achieved", "launched",
  "architected", "automated", "collaborated", "created", "deployed",
  "engineered", "established", "improved", "integrated", "mentored",
  "migrated", "orchestrated", "refactored", "scaled", "spearheaded",
  "streamlined", "transformed"
];

const QUANT_RE = /(\d+[%+x]|\$[\d,.]+|\d+\s*(users|customers|engineers|developers|team|members|requests|transactions|ms|seconds|minutes|hours|million|billion|k\b))/gi;

function getAllText(d) {
  const p = [];
  if (d.summary) p.push(d.summary);
  d.experiences.forEach(e => { if (e.responsibilities) p.push(e.responsibilities); });
  d.projects.forEach(pr => { if (pr.description) p.push(pr.description); });
  d.achievements.forEach(a => { if (a.details) p.push(a.details); });
  if (d.skills.languages) p.push(d.skills.languages);
  if (d.skills.frameworks) p.push(d.skills.frameworks);
  if (d.skills.databases) p.push(d.skills.databases);
  return p.join(" ");
}

function wc(d) {
  const ct = [d.contact.fullName, d.contact.targetRole, d.contact.city].filter(Boolean).join(" ");
  const edu = d.educations.map(e => [e.institution, e.degree, e.field, e.coursework, e.honors].filter(Boolean).join(" ")).join(" ");
  const cert = d.certifications.map(c => [c.name, c.org].filter(Boolean).join(" ")).join(" ");
  return [ct, getAllText(d), edu, cert].join(" ").split(/\s+/).filter(w => w.length > 0).length;
}

function scoreActionVerbs(d) {
  const text = getAllText(d).toLowerCase();
  const found = new Set();
  let total = 0;
  ACTION_VERBS.forEach(v => {
    const m = text.match(new RegExp(`\\b${v}\\w*\\b`, "gi"));
    if (m) { found.add(v); total += m.length; }
  });
  let score = 0;
  if (found.size >= 8) score += 15; else if (found.size >= 5) score += 10; else if (found.size >= 3) score += 7; else if (found.size >= 1) score += 3;
  if (total >= 12) score += 10; else if (total >= 8) score += 7; else if (total >= 4) score += 5; else if (total >= 1) score += 2;
  const sug = [];
  if (found.size < 5) sug.push({ type: "warning", message: "Use more varied action verbs", detail: `Only ${found.size} unique action verb(s). Use "Led", "Built", "Optimized", "Delivered".` });
  if (total < 4) sug.push({ type: "error", message: "Very few action verbs detected", detail: "Start each bullet with a strong action verb." });
  if (found.size >= 5 && total >= 8) sug.push({ type: "success", message: "Strong action verbs detected", detail: `${found.size} unique verbs, ${total} instances.` });
  return { score: Math.min(score, 25), suggestions: sug };
}

function scoreQuantification(d) {
  const bullets = [...d.experiences.map(e => e.responsibilities || ""), ...d.projects.map(p => p.description || "")].join(" ");
  const m = bullets.match(QUANT_RE) || [];
  let score = m.length >= 8 ? 20 : m.length >= 5 ? 15 : m.length >= 3 ? 10 : m.length >= 1 ? 5 : 0;
  const sug = [];
  if (m.length < 3) sug.push({ type: "error", message: "Add more quantified results", detail: `Only ${m.length} metric(s). Add numbers like "Improved by 40%", "Led team of 8".` });
  else if (m.length < 6) sug.push({ type: "warning", message: "Add more quantified achievements", detail: `${m.length} metrics found. Aim for 8+.` });
  else sug.push({ type: "success", message: "Good quantified achievements", detail: `${m.length} metrics detected.` });
  return { score: Math.min(score, 20), suggestions: sug };
}

function scoreContact(d) {
  let score = 0; const sug = []; const c = d.contact;
  if (c.email?.trim()) score += 2; else sug.push({ type: "error", message: "Email missing", detail: "Add your email address." });
  if (c.mobile?.trim()) score += 2; else sug.push({ type: "warning", message: "Phone number missing", detail: "Include a phone number." });
  if (c.linkedin?.trim()) score += 3; else sug.push({ type: "warning", message: "LinkedIn URL missing", detail: "Add your LinkedIn profile." });
  if (c.github?.trim() || c.portfolio?.trim()) score += 3; else sug.push({ type: "warning", message: "GitHub/Portfolio missing", detail: "Add a GitHub or portfolio link." });
  if (score === 10) sug.push({ type: "success", message: "Contact info complete", detail: "" });
  return { score: Math.min(score, 10), suggestions: sug };
}

function scoreSections(d) {
  let score = 0; const sug = [];
  if (d.summary?.trim()) { score += 4; sug.push({ type: "success", message: "Summary present", detail: "" }); }
  else sug.push({ type: "error", message: "Summary section empty", detail: "Add a 3-5 sentence professional summary." });
  if (d.experiences.length > 0 && d.experiences.some(e => e.company?.trim())) { score += 6; sug.push({ type: "success", message: "Experience present", detail: "" }); }
  else sug.push({ type: "error", message: "Experience missing", detail: "Add work experience." });
  if (d.educations.length > 0 && d.educations.some(e => e.institution?.trim())) { score += 4; sug.push({ type: "success", message: "Education present", detail: "" }); }
  else sug.push({ type: "error", message: "Education missing", detail: "Add educational background." });
  if (d.skills.languages?.trim() || d.skills.frameworks?.trim() || d.skills.databases?.trim()) { score += 4; sug.push({ type: "success", message: "Skills present", detail: "" }); }
  else sug.push({ type: "error", message: "Skills missing", detail: "Add technical skills." });
  if (d.projects.length > 0 && d.projects.some(p => p.name?.trim())) { score += 2; sug.push({ type: "success", message: "Projects present", detail: "" }); }
  else sug.push({ type: "warning", message: "Projects missing", detail: "Add projects to showcase skills." });
  return { score: Math.min(score, 20), suggestions: sug };
}

function scoreSkills(d) {
  let score = 0; const sug = [];
  const check = (val, label, hint) => {
    if (val?.trim()) { const c = val.split(/[,;]+/).filter(s => s.trim()).length; score += c >= 3 ? 5 : 3; }
    else sug.push({ type: "warning", message: `No ${label} listed`, detail: hint });
  };
  check(d.skills.languages, "programming languages", "Add languages like Python, Java, TypeScript.");
  check(d.skills.frameworks, "frameworks/tools", "Add frameworks like React, Docker, Kubernetes.");
  check(d.skills.databases, "databases/cloud", "Add databases like PostgreSQL, AWS, GCP.");
  if (score >= 12) sug.push({ type: "success", message: "Well-categorized skills", detail: "" });
  return { score: Math.min(score, 15), suggestions: sug };
}

function scoreContentQuality(d) {
  let score = 0; const sug = [];
  if (d.summary?.trim()) {
    const s = d.summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (s.length >= 3 && s.length <= 6) score += 3;
    else if (s.length >= 2) { score += 2; sug.push({ type: "warning", message: "Summary could be longer", detail: `${s.length} sentence(s). Aim for 3-5.` }); }
    else { score += 1; sug.push({ type: "error", message: "Summary too short", detail: "Expand to 3-5 sentences." }); }
  }
  const few = [];
  d.experiences.forEach(e => {
    if (e.company?.trim()) {
      const b = (e.responsibilities || "").split(/\n|•|[-–]/).filter(b => b.trim().length > 10);
      if (b.length < 3) few.push(e.company);
    }
  });
  if (d.experiences.length > 0 && few.length === 0) score += 4;
  else if (few.length > 0) { score += 1; sug.push({ type: "error", message: "Less than 3 bullets per job", detail: `Add more bullets for: ${few.join(", ")}.` }); }
  const words = wc(d);
  if (words >= 400 && words <= 700) score += 3;
  else if (words >= 250 && words <= 900) { score += 2; sug.push({ type: "warning", message: words < 400 ? "Resume may be too short" : "Resume may exceed one page", detail: `${words} words. Aim for 400-700.` }); }
  else { score += 1; sug.push({ type: words < 250 ? "error" : "warning", message: words < 250 ? "Resume too short" : "Resume too long", detail: `${words} words detected.` }); }
  return { score: Math.min(score, 10), suggestions: sug };
}

export function calculateATSScore(resumeData) {
  const cats = [
    { name: "Action Verbs", maxPoints: 25, ...scoreActionVerbs(resumeData) },
    { name: "Quantified Impact", maxPoints: 20, ...scoreQuantification(resumeData) },
    { name: "Contact Info", maxPoints: 10, ...scoreContact(resumeData) },
    { name: "Section Completeness", maxPoints: 20, ...scoreSections(resumeData) },
    { name: "Skills Relevance", maxPoints: 15, ...scoreSkills(resumeData) },
    { name: "Content Quality", maxPoints: 10, ...scoreContentQuality(resumeData) },
  ];
  const score = cats.reduce((s, c) => s + c.score, 0);
  const allSug = cats.flatMap(c => c.suggestions);
  const pri = { error: 0, warning: 1, success: 2 };
  allSug.sort((a, b) => (pri[a.type] ?? 3) - (pri[b.type] ?? 3));
  return { score: Math.min(score, 100), maxScore: 100, breakdown: cats.map(c => ({ name: c.name, score: c.score, maxPoints: c.maxPoints })), suggestions: allSug, wordCount: wc(resumeData) };
}

export function getScoreLabel(score) {
  if (score >= 90) return { label: "Excellent — ATS Ready", color: "#22c55e", emoji: "🟢" };
  if (score >= 70) return { label: "Good — Minor Improvements Needed", color: "#eab308", emoji: "🟡" };
  if (score >= 50) return { label: "Fair — Needs Work", color: "#f97316", emoji: "🟠" };
  return { label: "Poor — Major Changes Required", color: "#ef4444", emoji: "🔴" };
}
