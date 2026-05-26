import React from "react";
import { Bookmark, ExternalLink, MapPin, Clock, Banknote, Globe, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Highlight } from "./ui/perspective-highlight";

const formatJobType = (type) => {
  if (!type) return null;
  const map = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
    other: "Other",
  };
  return map[type] || type.replace(/_/g, " ");
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false }) + " ago";
  } catch {
    return "";
  }
};

// Color palette for job type badges
const getJobTypeStyle = (type) => {
  const styles = {
    full_time: { bg: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "rgba(99, 102, 241, 0.3)" },
    part_time: { bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "rgba(168, 85, 247, 0.3)" },
    contract: { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
    freelance: { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "rgba(34, 197, 94, 0.3)" },
    internship: { bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", border: "rgba(14, 165, 233, 0.3)" },
  };
  return styles[type] || { bg: "rgba(255, 255, 255, 0.08)", color: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.15)" };
};

const JobCard = ({ job, isSaved, onToggleSave, savingId }) => {
  const {
    id,
    title,
    company_name,
    company_logo,
    url,
    job_type,
    publication_date,
    candidate_required_location,
    salary,
  } = job;

  const timeAgo = getTimeAgo(publication_date);
  const jobTypeLabel = formatJobType(job_type);
  const isSaving = savingId === id;
  const initial = (company_name || "?").charAt(0).toUpperCase();
  const typeStyle = getJobTypeStyle(job_type);

  // Determine if remote
  const isRemote = candidate_required_location?.toLowerCase().includes("remote") ||
                   candidate_required_location?.toLowerCase().includes("anywhere") ||
                   candidate_required_location?.toLowerCase().includes("worldwide");

  return (
    <div className="jc-card" id={`job-card-${id}`}>
      {/* Gradient accent line */}
      <div className="jc-card__accent" />

      {/* Header: Logo + Company + Save */}
      <div className="jc-card__header">
        <div className="jc-card__company-info">
          {company_logo ? (
            <img
              src={company_logo}
              alt={`${company_name} logo`}
              className="jc-card__logo"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="jc-card__logo-fallback"
            style={company_logo ? { display: "none" } : {}}
          >
            {initial}
          </div>
          <div className="jc-card__company-details">
            <span className="jc-card__company-name">{company_name}</span>
            {timeAgo && (
              <span className="jc-card__posted">
                <Clock size={11} />
                {timeAgo}
              </span>
            )}
          </div>
        </div>

        <button
          className={`jc-card__save-btn ${isSaved ? "jc-card__save-btn--saved" : ""}`}
          onClick={() => onToggleSave(job)}
          disabled={isSaving}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          <Bookmark
            size={14}
            fill={isSaved ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Title */}
      <h3 className="jc-card__title">{title}</h3>

      {/* Tags Row */}
      <div className="jc-card__tags">
        {jobTypeLabel && (
          <Highlight
            color="purple"
            className="jc-card__tag"
            style={{
              borderColor: typeStyle.border,
            }}
          >
            {jobTypeLabel}
          </Highlight>
        )}
        {isRemote && (
          <Highlight color="green" className="jc-card__tag">
            <Globe size={11} className="inline mr-1" />
            Remote
          </Highlight>
        )}
        {!isRemote && candidate_required_location && (
          <Highlight color="red" className="jc-card__tag">
            <Building2 size={11} className="inline mr-1" />
            On-site
          </Highlight>
        )}
      </div>

      {/* Details Row */}
      <div className="jc-card__details">
        {salary && (
          <div className="jc-card__detail-item">
            <Banknote size={13} />
            <span>{salary}</span>
          </div>
        )}
        {candidate_required_location && (
          <div className="jc-card__detail-item">
            <MapPin size={13} />
            <span>
              {candidate_required_location.length > 30
                ? candidate_required_location.slice(0, 30) + "…"
                : candidate_required_location}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Apply Button */}
      <div className="jc-card__footer">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="jc-card__apply-btn"
          id={`apply-btn-${id}`}
        >
          <span>Apply Now</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

export default JobCard;
