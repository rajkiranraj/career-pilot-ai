import { useMemo } from "react";
import "../styles/resumePreview.css";

/**
 * Parses bullet-point text (newline or "•" separated) into an array of strings.
 */
function parseBullets(text) {
  if (!text?.trim()) return [];
  return text
    .split(/\n|•/)
    .map(b => b.replace(/^[-–—]\s*/, "").trim())
    .filter(b => b.length > 0);
}

/**
 * Live-rendered resume preview with FAANG-standard styling.
 * All form state is passed as props — zero internal state.
 */
export default function ResumePreview({ contact, summary, skills, experiences, educations, projects, certifications, achievements, publications = [], volunteerWork = [] }) {
  const wordCount = useMemo(() => {
    const parts = [
      contact.fullName, contact.targetRole, contact.city,
      summary,
      skills.languages, skills.frameworks, skills.databases,
      ...experiences.map(e => [e.company, e.jobTitle, e.location, e.responsibilities].join(" ")),
      ...educations.map(e => [e.institution, e.degree, e.field, e.coursework, e.honors].join(" ")),
      ...projects.map(p => [p.name, p.techStack, p.description].join(" ")),
      ...certifications.map(c => [c.name, c.org].join(" ")),
      ...achievements.map(a => [a.title, a.details].join(" ")),
    ].filter(Boolean).join(" ");
    return parts.split(/\s+/).filter(w => w.length > 0).length;
  }, [contact, summary, skills, experiences, educations, projects, certifications, achievements]);

  const isEmpty = !contact.fullName?.trim() && !summary?.trim()
    && experiences.length === 0 && educations.length === 0;

  if (isEmpty) {
    return (
      <div className="resume-preview-wrapper">
        <div className="resume-preview-page">
          <div className="resume-empty-state">
            <div className="icon"></div>
            <h3>Your resume preview will appear here</h3>
            <p>Start filling in the form to see your resume take shape in real-time.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasSkills = skills.languages?.trim() || skills.frameworks?.trim() || skills.databases?.trim();
  const hasExperience = experiences.some(e => e.company?.trim() || e.jobTitle?.trim());
  const hasEducation = educations.some(e => e.institution?.trim());
  const hasProjects = projects.some(p => p.name?.trim());
  const hasCerts = certifications.some(c => c.name?.trim());
  const hasAchievements = achievements.some(a => a.title?.trim());
  const hasPublications = publications.some(p => p.title?.trim());
  const hasVolunteer = volunteerWork.some(v => v.org?.trim());

  // Build contact info items
  const contactItems = [];
  if (contact.email?.trim()) contactItems.push({ text: contact.email, href: `mailto:${contact.email}` });
  if (contact.mobile?.trim()) contactItems.push({ text: contact.mobile });
  if (contact.linkedin?.trim()) contactItems.push({ text: "LinkedIn", href: contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}` });
  if (contact.github?.trim()) contactItems.push({ text: "GitHub", href: contact.github.startsWith("http") ? contact.github : `https://${contact.github}` });
  if (contact.portfolio?.trim()) contactItems.push({ text: "Portfolio", href: contact.portfolio.startsWith("http") ? contact.portfolio : `https://${contact.portfolio}` });
  if (contact.twitter?.trim()) contactItems.push({ text: "Twitter", href: contact.twitter.startsWith("http") ? contact.twitter : `https://${contact.twitter}` });

  let sectionIdx = 0;

  return (
    <div className="resume-preview-wrapper">
      <div className="resume-preview-page">
        {/* Accent stripe */}
        <div className="resume-accent-stripe" />
        {/* ——— Header ——— */}
        <div className="resume-header resume-section-animate" style={{ animationDelay: "0ms" }}>
          {contact.fullName?.trim() && <h1 className="resume-name">{contact.fullName}</h1>}
          {contact.targetRole?.trim() && <p className="resume-target-role">{contact.targetRole}</p>}
          {contactItems.length > 0 && (
            <div className="resume-contact-bar">
              {contactItems.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span className="separator"> | </span>}
                  {item.href
                    ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.text}</a>
                    : <span>{item.text}</span>
                  }
                </span>
              ))}
            </div>
          )}
          {contact.city?.trim() && <p className="resume-location">{contact.city}</p>}
        </div>

        {/* ——— Summary ——— */}
        {summary?.trim() && (
          <div className={`resume-section resume-section-animate`} style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Summary</h2>
            <p style={{ fontSize: "11.5px", color: "#2a2a2a", margin: 0, lineHeight: 1.6 }}>{summary}</p>
          </div>
        )}

        {/* ——— Experience ——— */}
        {hasExperience && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Experience</h2>
            {experiences.filter(e => e.company?.trim() || e.jobTitle?.trim()).map((exp, i) => {
              const end = exp.currentlyWorking ? "Present" : exp.endDate;
              const dateStr = [exp.startDate, end].filter(Boolean).join(" – ");
              const bullets = parseBullets(exp.responsibilities);
              return (
                <div key={i} className="resume-exp-item">
                  <div className="resume-exp-header">
                    <span className="resume-exp-company">{exp.company}</span>
                    {dateStr && <span className="resume-exp-dates">{dateStr}</span>}
                  </div>
                  {exp.jobTitle?.trim() && <div className="resume-exp-title">{exp.jobTitle}</div>}
                  {exp.location?.trim() && <div className="resume-exp-location">{exp.location}</div>}
                  {bullets.length > 0 && (
                    <ul className="resume-bullets">
                      {bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ——— Education ——— */}
        {hasEducation && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Education</h2>
            {educations.filter(e => e.institution?.trim()).map((edu, i) => {
              const yearStr = [edu.startYear, edu.gradYear].filter(Boolean).join(" – ");
              return (
                <div key={i} className="resume-edu-item">
                  <div className="resume-edu-header">
                    <span className="resume-edu-institution">{edu.institution}</span>
                    {yearStr && <span className="resume-edu-year">{yearStr}</span>}
                  </div>
                  {(edu.degree?.trim() || edu.field?.trim()) && (
                    <div className="resume-edu-degree">
                      {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                    </div>
                  )}
                  {(edu.gpa?.trim() || edu.coursework?.trim()) && (
                    <div className="resume-edu-meta">
                      {[edu.gpa && `GPA: ${edu.gpa}`, edu.coursework && `Coursework: ${edu.coursework}`].filter(Boolean).join(" | ")}
                    </div>
                  )}
                  {edu.honors?.trim() && <div className="resume-edu-meta">{edu.honors}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* ——— Skills ——— */}
        {hasSkills && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Skills</h2>
            {skills.languages?.trim() && (
              <div className="resume-skill-row">
                <span className="resume-skill-label">Languages: </span>
                <span className="resume-skill-value">{skills.languages}</span>
              </div>
            )}
            {skills.frameworks?.trim() && (
              <div className="resume-skill-row">
                <span className="resume-skill-label">Frameworks & Tools: </span>
                <span className="resume-skill-value">{skills.frameworks}</span>
              </div>
            )}
            {skills.databases?.trim() && (
              <div className="resume-skill-row">
                <span className="resume-skill-label">Databases & Cloud: </span>
                <span className="resume-skill-value">{skills.databases}</span>
              </div>
            )}
          </div>
        )}

        {/* ——— Projects ——— */}
        {hasProjects && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Projects</h2>
            {projects.filter(p => p.name?.trim()).map((proj, i) => {
              const bullets = parseBullets(proj.description);
              return (
                <div key={i} className="resume-proj-item">
                  <div className="resume-proj-header">
                    <span className="resume-proj-name">{proj.name}</span>
                    <span className="resume-proj-links">
                      {proj.liveUrl?.trim() && (
                        <a href={proj.liveUrl.startsWith("http") ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noopener noreferrer">Live ↗</a>
                      )}
                      {proj.githubUrl?.trim() && (
                        <a href={proj.githubUrl.startsWith("http") ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                      )}
                    </span>
                  </div>
                  {proj.techStack?.trim() && <div className="resume-proj-tech">{proj.techStack}</div>}
                  {bullets.length > 0 && (
                    <ul className="resume-bullets">
                      {bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ——— Certifications ——— */}
        {hasCerts && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Certifications</h2>
            {certifications.filter(c => c.name?.trim()).map((cert, i) => (
              <div key={i} className="resume-cert-item">
                <span className="resume-cert-name">{cert.name}</span>
                {cert.org?.trim() && <span className="resume-cert-meta"> — {cert.org}</span>}
                {cert.date?.trim() && <span className="resume-cert-meta"> | {cert.date}</span>}
                {cert.url?.trim() && (
                  <>
                    {" "}
                    <a href={cert.url.startsWith("http") ? cert.url : `https://${cert.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0077b5", fontSize: "11px", textDecoration: "none" }}>Verify ↗</a>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ——— Achievements ——— */}
        {hasAchievements && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Achievements</h2>
            {achievements.filter(a => a.title?.trim()).map((ach, i) => (
              <div key={i} className="resume-ach-item">
                <span className="resume-ach-title">{ach.title}</span>
                {ach.platform?.trim() && <span className="resume-ach-meta"> | {ach.platform}</span>}
                {ach.date?.trim() && <span className="resume-ach-meta"> | {ach.date}</span>}
                {ach.details?.trim() && <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{ach.details}</div>}
              </div>
            ))}
          </div>
        )}

        {/* ——— Publications ——— */}
        {hasPublications && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Publications</h2>
            {publications.filter(p => p.title?.trim()).map((pub, i) => (
              <div key={i} className="resume-cert-item">
                <span className="resume-cert-name">{pub.title}</span>
                {pub.venue?.trim() && <span className="resume-cert-meta"> — {pub.venue}</span>}
                {pub.year?.trim() && <span className="resume-cert-meta"> | {pub.year}</span>}
                {pub.link?.trim() && (
                  <> <a href={pub.link.startsWith("http") ? pub.link : `https://${pub.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0077b5", fontSize: "11px", textDecoration: "none" }}>View ↗</a></>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ——— Volunteer Work ——— */}
        {hasVolunteer && (
          <div className="resume-section resume-section-animate" style={{ animationDelay: `${++sectionIdx * 50}ms` }}>
            <h2 className="resume-section-header">Volunteer Work</h2>
            {volunteerWork.filter(v => v.org?.trim()).map((vol, i) => {
              const bullets = parseBullets(vol.description);
              return (
                <div key={i} className="resume-exp-item">
                  <div className="resume-exp-header">
                    <span className="resume-exp-company">{vol.org}</span>
                    {vol.duration?.trim() && <span className="resume-exp-dates">{vol.duration}</span>}
                  </div>
                  {vol.role?.trim() && <div className="resume-exp-title">{vol.role}</div>}
                  {bullets.length > 0 && (
                    <ul className="resume-bullets">
                      {bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ——— Word Count ——— */}
        <div className={`resume-word-count${wordCount > 700 ? " over-limit" : ""}`}>
          {wordCount} words {wordCount > 700 ? "⚠️ — Consider trimming for one page" : wordCount < 300 ? "— Add more content" : ""}
        </div>
      </div>
    </div>
  );
}
