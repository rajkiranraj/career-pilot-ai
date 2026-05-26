import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchRemoteJobs,
  fetchJobCategories,
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "../services/RemoteJobsService";
import JobCard from "../components/JobCard";
import { Badge } from "../components/ui/badge";
import { BriefcaseIcon, Search, Globe, Building2, LayoutGrid } from "lucide-react";
import "../styles/remoteJobs.css";

const SKELETON_COUNT = 6;

const SkeletonCard = () => (
  <div className="jc-skeleton-card">
    <div className="jc-skeleton-accent" />
    <div className="jc-skeleton-row">
      <div className="jc-skeleton-circle" />
      <div className="jc-skeleton-lines">
        <div className="jc-skeleton-line jc-skeleton-line--sm" />
        <div className="jc-skeleton-line jc-skeleton-line--xs" />
      </div>
      <div className="jc-skeleton-circle jc-skeleton-circle--sm" />
    </div>
    <div className="jc-skeleton-line jc-skeleton-line--lg" />
    <div className="jc-skeleton-line jc-skeleton-line--md" />
    <div className="jc-skeleton-tags-row">
      <div className="jc-skeleton-tag" />
      <div className="jc-skeleton-tag" />
    </div>
    <div className="jc-skeleton-line jc-skeleton-line--md" style={{ marginTop: "auto" }} />
    <div className="jc-skeleton-btn" />
  </div>
);

// Job type filter options
const JOB_TYPE_FILTERS = [
  { key: "all", label: "All Jobs", icon: LayoutGrid },
  { key: "remote", label: "Remote", icon: Globe },
  { key: "onsite", label: "On-site", icon: Building2 },
];

const RemoteJobs = () => {
  const { user } = useAuth();

  // State
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [jobTypeFilter, setJobTypeFilter] = useState("all");

  // Debounce ref
  const debounceRef = useRef(null);

  // Load categories on mount
  useEffect(() => {
    fetchJobCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  // Load saved jobs on mount
  useEffect(() => {
    getSavedJobs()
      .then((saved) => {
        const ids = new Set(saved.map((s) => s.remotive_job_id));
        setSavedJobIds(ids);
      })
      .catch(() => {});
  }, []);

  // Filter jobs by type when jobs or jobTypeFilter changes
  useEffect(() => {
    if (jobTypeFilter === "all") {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter((job) => {
      const location = (job.candidate_required_location || "").toLowerCase();
      const isRemote =
        location.includes("remote") ||
        location.includes("anywhere") ||
        location.includes("worldwide");

      if (jobTypeFilter === "remote") return isRemote;
      if (jobTypeFilter === "onsite") return !isRemote;
      return true;
    });

    setFilteredJobs(filtered);
  }, [jobs, jobTypeFilter]);

  // Fetch jobs (debounced)
  const loadJobs = useCallback(
    async (searchTerm, cat) => {
      try {
        setLoading(true);
        setError("");

        const params = {
          search: searchTerm || "",
          category: cat || "",
          limit: 50,
        };

        const result = await fetchRemoteJobs(params);
        setJobs(result);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Unable to fetch jobs right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    loadJobs("", "");
  }, [loadJobs]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadJobs(value, category);
    }, 500);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    loadJobs(search, value);
  };

  // Toggle save
  const handleToggleSave = async (job) => {
    if (savingId) return;
    setSavingId(job.id);

    try {
      if (savedJobIds.has(job.id)) {
        await unsaveJob(job.id);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
      } else {
        await saveJob(job);
        setSavedJobIds((prev) => new Set(prev).add(job.id));
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSavingId(null);
    }
  };

  // Count jobs by type
  const remoteCount = jobs.filter((j) => {
    const loc = (j.candidate_required_location || "").toLowerCase();
    return loc.includes("remote") || loc.includes("anywhere") || loc.includes("worldwide");
  }).length;
  const onsiteCount = jobs.length - remoteCount;

  return (
    <div className="remote-jobs-page space-y-8">
      {/* Page Header */}
      <div className="jb-header">
        <div className="jb-header__left">
          <div className="jb-header__badge">
            <span className="jb-header__badge-dot" />
            <span>Live Job Feed</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-2">
            Job Board
          </h1>
          <p className="text-white/50 font-body font-light">
            Discover opportunities from top companies — remote and on-site
          </p>
        </div>
        {!loading && filteredJobs.length > 0 && (
          <div className="jb-header__stats">
            <div className="jb-stat">
              <span className="jb-stat__number">{jobs.length}</span>
              <span className="jb-stat__label">Total Jobs</span>
            </div>
            <div className="jb-stat__divider" />
            <div className="jb-stat">
              <span className="jb-stat__number">{remoteCount}</span>
              <span className="jb-stat__label">Remote</span>
            </div>
            <div className="jb-stat__divider" />
            <div className="jb-stat">
              <span className="jb-stat__number">{onsiteCount}</span>
              <span className="jb-stat__label">On-site</span>
            </div>
          </div>
        )}
      </div>

      {/* Job Type Toggle */}
      <div className="jb-type-toggle" id="job-type-toggle">
        {JOB_TYPE_FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`jb-type-toggle__btn ${jobTypeFilter === key ? "jb-type-toggle__btn--active" : ""}`}
            onClick={() => setJobTypeFilter(key)}
            id={`job-type-${key}`}
          >
            <Icon size={15} />
            <span>{label}</span>
            {key === "all" && <span className="jb-type-toggle__count">{jobs.length}</span>}
            {key === "remote" && <span className="jb-type-toggle__count">{remoteCount}</span>}
            {key === "onsite" && <span className="jb-type-toggle__count">{onsiteCount}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rj-filters">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="rj-search-input"
            placeholder="Search job titles, companies, descriptions..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: 42 }}
            id="remote-jobs-search"
          />
        </div>

        <select
          className="rj-category-select"
          value={category}
          onChange={handleCategoryChange}
          id="remote-jobs-category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id || cat.slug || cat.name} value={cat.slug || cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="rj-error">
          <p className="rj-error__title">Something went wrong</p>
          <p className="rj-error__text">{error}</p>
          <button
            onClick={() => loadJobs(search, category)}
            className="jc-card__apply-btn"
            style={{ margin: "0 auto", display: "inline-flex" }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="rj-grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && !error && filteredJobs.length > 0 && (
        <div className="rj-grid">
          {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="jc-card-wrapper animate-element"
              style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
            >
              <JobCard
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onToggleSave={handleToggleSave}
                savingId={savingId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredJobs.length === 0 && (
        <div className="rj-empty">
          <BriefcaseIcon className="rj-empty__icon" />
          <p className="rj-empty__title">No jobs found</p>
          <p className="rj-empty__text">
            Try adjusting your search, category, or job type filter
          </p>
        </div>
      )}

      {/* Attribution (Remotive TOS) */}
      {!loading && filteredJobs.length > 0 && (
        <div className="rj-attribution">
          Jobs provided by{" "}
          <a
            href="https://remotive.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Remotive
          </a>
        </div>
      )}
    </div>
  );
};

export default RemoteJobs;
