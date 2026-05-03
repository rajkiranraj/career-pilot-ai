import { useState, useEffect } from "react";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import ResumePreview from "../components/ResumePreview";
import ATSScoreChecker from "../components/ATSScoreChecker";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getResume, saveResume } from "../services/ResumeService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Prompt types mapped to server-side system prompts in the enhance-text edge function:
// summary | experience | project | skills | achievement | general

const EXP_T = { company: "", jobTitle: "", location: "", startDate: "", endDate: "", currentlyWorking: false, responsibilities: "" };
const EDU_T = { institution: "", degree: "", field: "", startYear: "", gradYear: "", gpa: "", coursework: "", honors: "" };
const PROJ_T = { name: "", techStack: "", liveUrl: "", githubUrl: "", description: "" };
const CERT_T = { name: "", org: "", date: "", url: "" };
const ACH_T = { title: "", platform: "", date: "", details: "" };
const PUB_T = { title: "", venue: "", year: "", link: "" };
const VOL_T = { org: "", role: "", duration: "", description: "" };

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("edit");
  const { user, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const [contact, setContact] = useState({ fullName: "", targetRole: "", email: "", mobile: "", linkedin: "", twitter: "", city: "", github: "", portfolio: "" });
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState({ languages: "", frameworks: "", databases: "" });
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [publications, setPublications] = useState([]);
  const [volunteerWork, setVolunteerWork] = useState([]);
  const [loadingFields, setLoadingFields] = useState({});

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  useEffect(() => {
    (async () => {
      try {
        const r = await getResume();
        if (r.success && r.data) setActiveTab("preview");
      } catch (e) { console.error("Error fetching resume:", e); }
      finally { setInitialLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (user?.email && !contact.email) setContact(p => ({ ...p, email: user.email }));
  }, [user]);

  const upd = (setter, i, k, v) => setter(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const handleAI = async (fieldKey, val, promptType, onUpdate) => {
    if (!val?.trim()) { toast.error("Please enter content first"); return; }
    setLoadingFields(p => ({ ...p, [fieldKey]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('enhance-text', {
        body: { text: val, type: promptType },
      });

      // supabase.functions.invoke error handling
      if (error) {
        // When edge function returns non-2xx, the body is in error.context (a Response)
        let msg = error.message || "Edge function error";
        if (error.context && typeof error.context.json === "function") {
          try {
            const errBody = await error.context.json();
            msg = errBody.error || msg;
          } catch (_) { /* ignore parse failure */ }
        }
        throw new Error(msg);
      }

      // data may come back as a string instead of parsed object
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      if (!parsed?.improved) {
        console.error("Unexpected response shape:", parsed);
        throw new Error("No improved text returned");
      }

      onUpdate(parsed.improved);
      setLoadingFields(p => ({ ...p, [fieldKey]: false }));
    } catch (e) {
      console.error("AI error:", e);
      setLoadingFields(p => ({ ...p, [fieldKey]: "error" }));
      toast.error(e.message || "AI improvement failed");
    }
  };

  const handleATSFix = async () => {
    const resumeText = getMarkdown();
    const { data: atsData } = await import("../utils/atsScorer").then(m => {
      const d = { contact, summary, skills, experiences, educations, projects, certifications, achievements };
      return { data: m.calculateATSScore(d) };
    });
    const suggestions = atsData.suggestions.filter(s => s.type !== "success").map(s => s.message + ": " + (s.detail || "")).join("\n");
    const fullText = `RESUME:\n${resumeText}\n\nATS ISSUES TO FIX:\n${suggestions}`;
    setLoadingFields(p => ({ ...p, ats_fix: true }));
    try {
      const { data, error } = await supabase.functions.invoke('enhance-text', {
        body: { text: fullText, type: 'ats_fix' },
      });
      if (error) {
        let msg = error.message || "Edge function error";
        if (error.context && typeof error.context.json === "function") {
          try { const errBody = await error.context.json(); msg = errBody.error || msg; } catch (_) {}
        }
        throw new Error(msg);
      }
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed?.ats_fix) {
        const fix = parsed.ats_fix;
        if (fix.summary) setSummary(fix.summary);
        if (fix.skills) {
          if (fix.skills.languages) setSkills(p => ({ ...p, languages: fix.skills.languages }));
          if (fix.skills.frameworks) setSkills(p => ({ ...p, frameworks: fix.skills.frameworks }));
          if (fix.skills.databases) setSkills(p => ({ ...p, databases: fix.skills.databases }));
        }
        if (fix.experiences && Array.isArray(fix.experiences)) {
          fix.experiences.forEach(e => {
            if (typeof e.index === 'number' && e.responsibilities) {
              setExperiences(prev => prev.map((item, idx) => idx === e.index ? { ...item, responsibilities: e.responsibilities } : item));
            }
          });
        }
        if (fix.projects && Array.isArray(fix.projects)) {
          fix.projects.forEach(p => {
            if (typeof p.index === 'number' && p.description) {
              setProjects(prev => prev.map((item, idx) => idx === p.index ? { ...item, description: p.description } : item));
            }
          });
        }
        toast.success("Resume improved based on ATS suggestions!");
      } else if (parsed?.improved) {
        toast.info("AI returned general improvements. Check your resume.");
      } else {
        throw new Error("Unexpected response from AI");
      }
      setLoadingFields(p => ({ ...p, ats_fix: false }));
    } catch (e) {
      console.error("ATS fix error:", e);
      setLoadingFields(p => ({ ...p, ats_fix: "error" }));
      toast.error(e.message || "AI fix failed");
    }
  };

  const aiBtn = (fieldKey, val, promptType, onUpdate) => {
    const s = loadingFields[fieldKey];
    return (
      <Button type="button" variant="ghost" size="sm"
        className={`rounded-full text-xs ${s === "error" ? "text-red-400" : ""}`}
        style={s === true ? { opacity: 0.6 } : {}}
        disabled={s === true}
        onClick={() => handleAI(fieldKey, val, promptType, onUpdate)}>
        {s === true ? "✨ Enhancing..." : s === "error" ? "✨ Retry" : "✨ Enhance with AI"}
      </Button>
    );
  };

  const F = (label, val, onChange, ph) => (
    <div className="space-y-2 text-left">
      <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">{label}</Label>
      <Input value={val} onChange={e => onChange(e.target.value)} placeholder={ph} />
    </div>
  );

  const FF = (label, val, onChange, ph) => (
    <div className="space-y-2 text-left md:col-span-2">
      <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">{label}</Label>
      <Input value={val} onChange={e => onChange(e.target.value)} placeholder={ph} />
    </div>
  );

  const TAField = (label, val, onChange, ph, fieldKey, promptType, cls = "h-32") => (
    <div className="space-y-2 text-left md:col-span-2">
      <div className="flex justify-between items-center">
        <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">{label}</Label>
        {aiBtn(fieldKey, val, promptType, onChange)}
      </div>
      <Textarea value={val} onChange={e => onChange(e.target.value)} placeholder={ph} className={cls} />
    </div>
  );

  const DynSec = (title, items, setItems, template, addLabel, renderFields) => (
    <div className="space-y-6">
      <h3 className="text-xl font-heading italic text-white border-b border-white/10 pb-4">{title}</h3>
      {items.map((item, i) => (
        <div key={i} className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-8 liquid-glass rounded-2xl border border-white/5">
          <Button type="button" variant="ghost" size="icon"
            className="rounded-full h-8 w-8 absolute top-4 right-4 z-10"
            onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}>×</Button>
          {renderFields(item, i)}
        </div>
      ))}
      <Button type="button" variant="glass"
        className="w-full rounded-2xl py-8 border-dashed border-white/20 hover:border-white/40 text-white/50 hover:text-white transition-all"
        onClick={() => setItems(prev => [...prev, { ...template }])}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">+</span>
          <span className="text-xs uppercase tracking-widest">Add {addLabel}</span>
        </div>
      </Button>
    </div>
  );

  const getMarkdown = () => {
    const L = [];
    const { fullName, targetRole, city, email, mobile, linkedin, github, portfolio } = contact;
    if (fullName) L.push(`# ${fullName}`);
    const info = [targetRole, city, email, mobile, linkedin, github, portfolio].filter(Boolean);
    if (info.length) L.push(info.join(" | "));
    if (summary) L.push("", "## Professional Summary", "", summary);
    if (skills.languages || skills.frameworks || skills.databases) {
      L.push("", "## Skills");
      if (skills.languages) L.push(`**Languages:** ${skills.languages}`);
      if (skills.frameworks) L.push(`**Frameworks & Tools:** ${skills.frameworks}`);
      if (skills.databases) L.push(`**Databases & Cloud:** ${skills.databases}`);
    }
    if (experiences.length) {
      L.push("", "## Work Experience");
      experiences.forEach(e => {
        const end = e.currentlyWorking ? "Present" : e.endDate;
        L.push("", `### ${e.jobTitle} — ${e.company} | ${e.location} | ${e.startDate} – ${end}`);
        if (e.responsibilities) L.push(e.responsibilities);
      });
    }
    if (projects.length) {
      L.push("", "## Projects");
      projects.forEach(p => {
        L.push("", `### ${p.name} | ${p.techStack}`);
        const links = [p.liveUrl && `Live: ${p.liveUrl}`, p.githubUrl && `GitHub: ${p.githubUrl}`].filter(Boolean);
        if (links.length) L.push(links.join(" "));
        if (p.description) L.push(p.description);
      });
    }
    if (educations.length) {
      L.push("", "## Education");
      educations.forEach(e => {
        L.push("", `### ${e.degree} in ${e.field} — ${e.institution} | ${e.startYear} – ${e.gradYear}`);
        const d = [e.gpa && `GPA: ${e.gpa}`, e.coursework && `Coursework: ${e.coursework}`].filter(Boolean);
        if (d.length) L.push(d.join(" | "));
        if (e.honors) L.push(e.honors);
      });
    }
    if (certifications.length) {
      L.push("", "## Certifications");
      certifications.forEach(c => L.push(`- ${c.name} — ${c.org} | ${c.date}${c.url ? " | " + c.url : ""}`));
    }
    if (achievements.length) {
      L.push("", "## Achievements");
      achievements.forEach(a => {
        L.push(`- ${a.title} | ${a.platform} | ${a.date}`);
        if (a.details) L.push(`  ${a.details}`);
      });
    }
    return L.join("\n");
  };

  const getPrintHTML = () => {
    const L = [];
    const { fullName, targetRole, city, email, mobile, linkedin, github, portfolio } = contact;
    if (fullName) L.push(`<h1>${fullName}</h1>`);
    const info = [targetRole, city, email, mobile,
      linkedin && `<a href="${linkedin}">LinkedIn</a>`,
      github && `<a href="${github}">GitHub</a>`,
      portfolio && `<a href="${portfolio}">Portfolio</a>`].filter(Boolean);
    if (info.length) L.push(`<p>${info.join(" | ")}</p>`);
    if (summary) L.push(`<h2>Professional Summary</h2><p>${summary}</p>`);
    if (skills.languages || skills.frameworks || skills.databases) {
      L.push("<h2>Skills</h2>");
      if (skills.languages) L.push(`<p><strong>Languages:</strong> ${skills.languages}</p>`);
      if (skills.frameworks) L.push(`<p><strong>Frameworks &amp; Tools:</strong> ${skills.frameworks}</p>`);
      if (skills.databases) L.push(`<p><strong>Databases &amp; Cloud:</strong> ${skills.databases}</p>`);
    }
    if (experiences.length) {
      L.push("<h2>Work Experience</h2>");
      experiences.forEach(e => {
        const end = e.currentlyWorking ? "Present" : e.endDate;
        L.push(`<h3>${e.jobTitle} — ${e.company} | ${e.location} | ${e.startDate} – ${end}</h3>`);
        if (e.responsibilities) L.push(`<p>${e.responsibilities.replace(/\n/g, "<br/>")}</p>`);
      });
    }
    if (projects.length) {
      L.push("<h2>Projects</h2>");
      projects.forEach(p => {
        L.push(`<h3>${p.name} | ${p.techStack}</h3>`);
        if (p.description) L.push(`<p>${p.description.replace(/\n/g, "<br/>")}</p>`);
      });
    }
    if (educations.length) {
      L.push("<h2>Education</h2>");
      educations.forEach(e => {
        L.push(`<h3>${e.degree} in ${e.field} — ${e.institution} | ${e.startYear} – ${e.gradYear}</h3>`);
        const d = [e.gpa && `GPA: ${e.gpa}`, e.coursework && `Coursework: ${e.coursework}`].filter(Boolean);
        if (d.length) L.push(`<p>${d.join(" | ")}</p>`);
        if (e.honors) L.push(`<p>${e.honors}</p>`);
      });
    }
    if (certifications.length) {
      L.push("<h2>Certifications</h2><ul>");
      certifications.forEach(c => L.push(`<li>${c.name} — ${c.org} | ${c.date}${c.url ? ` | <a href="${c.url}">${c.url}</a>` : ""}</li>`));
      L.push("</ul>");
    }
    if (achievements.length) {
      L.push("<h2>Achievements</h2><ul>");
      achievements.forEach(a => L.push(`<li><strong>${a.title}</strong> | ${a.platform} | ${a.date}${a.details ? `<br/>${a.details}` : ""}</li>`));
      L.push("</ul>");
    }
    return L.join("\n");
  };

  const handlePrint = () => {
    const el = document.getElementById("print-resume");
    if (el) el.innerHTML = getPrintHTML();
    window.print();
  };

  const onSubmit = async () => {
    setIsSaving(true);
    try {
      const md = getMarkdown();
      const r = await saveResume(md);
      if (r.success) toast.success("Resume saved successfully!");
    } catch (e) { toast.error(e.message || "Failed to save resume"); }
    finally { setIsSaving(false); }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto py-12 text-center">
        Loading resume...
      </div>
    );
  }

  return (
    <div data-color-mode="dark" className="container mx-auto py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-2">
            Resume Builder
          </h1>
          <p className="text-white/50 font-body font-light">
            Craft your professional story with AI
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" onClick={onSubmit} disabled={isSaving} className="rounded-full">
            {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4 mr-2" />Save</>)}
          </Button>
          <Button variant="glass-strong" onClick={handlePrint} className="rounded-full">
            <Download className="h-4 w-4 mr-2" />Download PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="liquid-glass border border-white/5">
          <TabsTrigger value="edit">Form Editor</TabsTrigger>
          <TabsTrigger value="preview">Resume Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="space-y-12 max-w-4xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading italic text-white border-b border-white/10 pb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 liquid-glass rounded-2xl border border-white/5">
                {FF("Full Name", contact.fullName, v => setContact(p => ({ ...p, fullName: v })), "John Doe")}
                {FF("Target Role", contact.targetRole, v => setContact(p => ({ ...p, targetRole: v })), "Software Engineer II")}
                {F("Email", contact.email, v => setContact(p => ({ ...p, email: v })), "your@email.com")}
                {F("Mobile", contact.mobile, v => setContact(p => ({ ...p, mobile: v })), "+1 234 567 890")}
                {F("LinkedIn", contact.linkedin, v => setContact(p => ({ ...p, linkedin: v })), "linkedin.com/in/username")}
                {F("Twitter/X", contact.twitter, v => setContact(p => ({ ...p, twitter: v })), "twitter.com/username")}
                {F("City / State", contact.city, v => setContact(p => ({ ...p, city: v })), "San Francisco, CA")}
                {F("GitHub URL", contact.github, v => setContact(p => ({ ...p, github: v })), "github.com/username")}
                {F("Portfolio URL", contact.portfolio, v => setContact(p => ({ ...p, portfolio: v })), "yourportfolio.com")}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading italic text-white border-b border-white/10 pb-4">
                Professional Summary
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">Summary</Label>
                  {aiBtn("summary", summary, "summary", setSummary)}
                </div>
                <Textarea value={summary} onChange={e => setSummary(e.target.value)}
                  placeholder="Write a compelling professional summary..." className="h-40" />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-6">
              <h3 className="text-xl font-heading italic text-white border-b border-white/10 pb-4">
                Skills
              </h3>
              <div className="space-y-6">
                {TAField("Languages", skills.languages, v => setSkills(p => ({ ...p, languages: v })),
                  "Python, Java, C++, Go, TypeScript", "skills_languages", "skills")}
                {TAField("Frameworks & Tools", skills.frameworks, v => setSkills(p => ({ ...p, frameworks: v })),
                  "React, Node.js, Docker, Kubernetes, Redis", "skills_frameworks", "skills")}
                {TAField("Databases & Cloud", skills.databases, v => setSkills(p => ({ ...p, databases: v })),
                  "PostgreSQL, MongoDB, AWS, GCP, Firebase", "skills_databases", "skills")}
              </div>
            </div>

            {/* Work Experience */}
            {DynSec("Work Experience", experiences, setExperiences, EXP_T, "Experience", (item, i) => (<>
              {F("Company Name", item.company, v => upd(setExperiences, i, "company", v), "Google")}
              {F("Job Title / Role", item.jobTitle, v => upd(setExperiences, i, "jobTitle", v), "Senior Software Engineer")}
              {F("Location", item.location, v => upd(setExperiences, i, "location", v), "San Francisco, CA")}
              {F("Start Date", item.startDate, v => upd(setExperiences, i, "startDate", v), "MM/YYYY")}
              {F("End Date", item.endDate, v => upd(setExperiences, i, "endDate", v), "MM/YYYY or Present")}
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-3 ml-4 h-12">
                  <input type="checkbox" checked={item.currentlyWorking}
                    onChange={e => upd(setExperiences, i, "currentlyWorking", e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/20" />
                  <span className="text-sm font-body text-white/70">Currently Working Here</span>
                </div>
              </div>
              {TAField("Responsibilities & Impact", item.responsibilities,
                v => upd(setExperiences, i, "responsibilities", v),
                "• Led migration of monolith to microservices, reducing latency by 40%...",
                `exp_${i}_bullets`, "experience", "h-40")}
            </>))}

            {/* Education */}
            {DynSec("Education", educations, setEducations, EDU_T, "Education", (item, i) => (<>
              {F("Institution Name", item.institution, v => upd(setEducations, i, "institution", v), "Stanford University")}
              {F("Degree", item.degree, v => upd(setEducations, i, "degree", v), "B.Tech, M.S.")}
              {F("Field of Study", item.field, v => upd(setEducations, i, "field", v), "Computer Science")}
              {F("Start Year", item.startYear, v => upd(setEducations, i, "startYear", v), "YYYY")}
              {F("Graduation Year", item.gradYear, v => upd(setEducations, i, "gradYear", v), "YYYY or Expected")}
              {F("CGPA / GPA", item.gpa, v => upd(setEducations, i, "gpa", v), "3.8 / 4.0 (optional)")}
              {TAField("Relevant Coursework", item.coursework,
                v => upd(setEducations, i, "coursework", v),
                "Data Structures, Algorithms, Machine Learning (comma-separated)",
                `edu_${i}_coursework`, "coursework", "h-24")}
              {TAField("Honors / Awards", item.honors,
                v => upd(setEducations, i, "honors", v),
                "Dean's List, Summa Cum Laude (optional)",
                `edu_${i}_honors`, "honors", "h-16")}
            </>))}

            {/* Projects */}
            {DynSec("Projects", projects, setProjects, PROJ_T, "Project", (item, i) => (<>
              {F("Project Name", item.name, v => upd(setProjects, i, "name", v), "Portfolio Website")}
              {F("Tech Stack", item.techStack, v => upd(setProjects, i, "techStack", v), "React, Node.js, PostgreSQL")}
              {F("Live Demo URL", item.liveUrl, v => upd(setProjects, i, "liveUrl", v), "https://myproject.com (optional)")}
              {F("GitHub URL", item.githubUrl, v => upd(setProjects, i, "githubUrl", v), "github.com/user/project (optional)")}
              {TAField("Description & Impact", item.description,
                v => upd(setProjects, i, "description", v),
                "• Built X using Y, serving Z users with N% uptime...",
                `proj_${i}_desc`, "project", "h-32")}
            </>))}

            {/* Certifications */}
            {DynSec("Certifications", certifications, setCertifications, CERT_T, "Certification", (item, i) => (<>
              {F("Certification Name", item.name, v => upd(setCertifications, i, "name", v), "AWS Solutions Architect")}
              {F("Issuing Organization", item.org, v => upd(setCertifications, i, "org", v), "Amazon Web Services")}
              {F("Date Issued", item.date, v => upd(setCertifications, i, "date", v), "MM/YYYY")}
              {F("Credential URL", item.url, v => upd(setCertifications, i, "url", v), "https://credential.url (optional)")}
            </>))}

            {/* Achievements */}
            {DynSec("Achievements", achievements, setAchievements, ACH_T, "Achievement", (item, i) => (<>
              {FF("Title", item.title, v => upd(setAchievements, i, "title", v), "Top 21% globally on LeetCode")}
              {F("Platform / Issuer", item.platform, v => upd(setAchievements, i, "platform", v), "LeetCode")}
              {F("Date", item.date, v => upd(setAchievements, i, "date", v), "MM/YYYY")}
              {TAField("Details", item.details,
                v => upd(setAchievements, i, "details", v),
                "Brief details about this achievement...",
                `ach_${i}_details`, "achievement", "h-24")}
            </>))}

            {/* Publications */}
            {DynSec("Publications", publications, setPublications, PUB_T, "Publication", (item, i) => (<>
              {FF("Title", item.title, v => upd(setPublications, i, "title", v), "Attention Is All You Need")}
              {F("Venue / Conference", item.venue, v => upd(setPublications, i, "venue", v), "NeurIPS 2023")}
              {F("Year", item.year, v => upd(setPublications, i, "year", v), "YYYY")}
              {F("Link", item.link, v => upd(setPublications, i, "link", v), "https://arxiv.org/... (optional)")}
            </>))}

            {/* Volunteer Work */}
            {DynSec("Volunteer Work", volunteerWork, setVolunteerWork, VOL_T, "Volunteer Entry", (item, i) => (<>
              {F("Organization", item.org, v => upd(setVolunteerWork, i, "org", v), "Code.org")}
              {F("Role", item.role, v => upd(setVolunteerWork, i, "role", v), "Volunteer Mentor")}
              {F("Duration", item.duration, v => upd(setVolunteerWork, i, "duration", v), "Jan 2023 – Present")}
              {TAField("Description", item.description,
                v => upd(setVolunteerWork, i, "description", v),
                "Mentored 10+ students in web development...",
                `vol_${i}_desc`, "general", "h-24")}
            </>))}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-8 max-w-4xl mx-auto">
            <ResumePreview
              contact={contact}
              summary={summary}
              skills={skills}
              experiences={experiences}
              educations={educations}
              projects={projects}
              certifications={certifications}
              achievements={achievements}
              publications={publications}
              volunteerWork={volunteerWork}
            />
            <ATSScoreChecker
              contact={contact}
              summary={summary}
              skills={skills}
              experiences={experiences}
              educations={educations}
              projects={projects}
              certifications={certifications}
              achievements={achievements}
              onFixWithAI={handleATSFix}
              fixLoading={loadingFields.ats_fix}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div id="print-resume" style={{ display: "none" }} />
    </div>
  );
}
