import { decode as decodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { strFromU8, unzipSync } from "https://esm.sh/fflate@0.8.2";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_CHARS = 200_000;

const EXTENSION_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".rtf": "application/rtf",
};

const EXTRA_MIME_TYPES = ["text/rtf"];
export const SUPPORTED_MIME_TYPES = new Set([
  ...Object.values(EXTENSION_TO_MIME),
  ...EXTRA_MIME_TYPES,
]);
export const TEXT_MIME_TYPES = new Set(["text/plain", "application/rtf", "text/rtf"]);
export const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export const PDF_MIME_TYPES = new Set(["application/pdf"]);

export class ResumeParseError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status = 400,
    code = "BAD_REQUEST",
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ResumeParseError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const stripDataUrlPrefix = (value: string): string => {
  const trimmed = String(value || "").trim();
  if (!trimmed.startsWith("data:")) return trimmed;
  const idx = trimmed.indexOf(",");
  return idx === -1 ? trimmed : trimmed.slice(idx + 1);
};

export const estimateBase64Bytes = (base64: string): number => {
  const cleaned = String(base64 || "").replace(/\s/g, "");
  if (!cleaned) return 0;
  const padding = cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0;
  return Math.floor((cleaned.length * 3) / 4) - padding;
};

export const normalizeMimeType = (
  mimeType?: string,
  fileName?: string,
): string => {
  const normalized = String(mimeType || "").toLowerCase().trim();
  if (SUPPORTED_MIME_TYPES.has(normalized)) return normalized;
  const name = String(fileName || "").toLowerCase();
  const dot = name.lastIndexOf(".");
  const ext = dot === -1 ? "" : name.slice(dot);
  return EXTENSION_TO_MIME[ext] || normalized;
};

const decodeBase64ToBytes = (base64: string): Uint8Array => {
  try {
    return decodeBase64(base64);
  } catch (error) {
    throw new ResumeParseError(
      "Invalid file encoding. Please upload the file again.",
      400,
      "INVALID_BASE64",
      { reason: String(error?.message || error) },
    );
  }
};

const decodeBase64ToText = (base64: string): string => {
  const bytes = decodeBase64ToBytes(base64);
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
};

export const extractRtfText = (rtf: string): string => {
  if (!rtf) return "";
  const withHex = rtf.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isNaN(code) ? "" : String.fromCharCode(code);
  });
  const withUnicode = withHex.replace(/\\u(-?\d+)\??/g, (_, num) => {
    const code = Number.parseInt(num, 10);
    if (Number.isNaN(code)) return "";
    return String.fromCharCode(code < 0 ? 65536 + code : code);
  });
  const withBreaks = withUnicode
    .replace(/\\par[d]?/gi, "\n")
    .replace(/\\line/gi, "\n")
    .replace(/\\tab/gi, "\t");

  return withBreaks
    .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const extractDocxText = (bytes: Uint8Array): string => {
  let archive: Record<string, Uint8Array>;
  try {
    archive = unzipSync(bytes) as Record<string, Uint8Array>;
  } catch (error) {
    throw new ResumeParseError(
      "Unable to read DOCX file. Please re-save and try again.",
      422,
      "DOCX_UNZIP_FAILED",
      { reason: String(error?.message || error) },
    );
  }

  const xmlBytes = archive["word/document.xml"];
  if (!xmlBytes) {
    throw new ResumeParseError(
      "DOCX file is missing document.xml.",
      422,
      "DOCX_MISSING_XML",
    );
  }

  const xml = strFromU8(xmlBytes);
  const withBreaks = xml
    .replace(/<w:tab\b[^>]*\/?>/g, "\t")
    .replace(/<w:br\b[^>]*\/?>/g, "\n")
    .replace(/<\/w:p>/g, "\n");

  return withBreaks
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};


export const truncateText = (text: string, maxChars = MAX_TEXT_CHARS): string => {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.65));
  const tail = text.slice(-Math.floor(maxChars * 0.35));
  const omitted = text.length - head.length - tail.length;
  return `${head}\n\n[...${omitted} chars truncated...]\n\n${tail}`;
};

export type PreparedInput = {
  mode: "inline" | "text";
  mimeType: string;
  sizeBytes: number;
  warnings: string[];
  inlineData?: { mimeType: string; data: string };
  text?: string;
};

export const prepareResumeInput = async (params: {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  resumeText?: string;
}): Promise<PreparedInput> => {
  const warnings: string[] = [];
  const resumeText = typeof params?.resumeText === "string"
    ? params.resumeText
    : "";

  if (resumeText.trim()) {
    const normalized = normalizeMimeType(params.mimeType, params.fileName) ||
      "text/plain";
    if (!SUPPORTED_MIME_TYPES.has(normalized)) {
      warnings.push("MIME_FALLBACK_TEXT");
    }
    const trimmed = resumeText.trim();
    if (trimmed.length > MAX_TEXT_CHARS) warnings.push("TEXT_TRUNCATED");
    return {
      mode: "text",
      mimeType: normalized || "text/plain",
      sizeBytes: trimmed.length,
      warnings,
      text: truncateText(trimmed),
    };
  }

  if (!params?.fileBase64 || typeof params.fileBase64 !== "string") {
    throw new ResumeParseError(
      "fileBase64 is required and must be a string",
      400,
      "INVALID_FILE",
    );
  }

  const stripped = stripDataUrlPrefix(params.fileBase64);
  if (stripped !== params.fileBase64) warnings.push("DATA_URL_STRIPPED");

  const sizeBytes = estimateBase64Bytes(stripped);
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new ResumeParseError(
      "Invalid file encoding. Please upload the file again.",
      400,
      "INVALID_BASE64",
    );
  }
  if (sizeBytes > MAX_FILE_BYTES) {
    throw new ResumeParseError(
      "Resume file exceeds the 10 MB limit.",
      413,
      "FILE_TOO_LARGE",
      { sizeBytes },
    );
  }

  const normalizedMimeType = normalizeMimeType(
    params.mimeType,
    params.fileName,
  );

  if (!SUPPORTED_MIME_TYPES.has(normalizedMimeType)) {
    throw new ResumeParseError(
      "Unsupported file type. Use PDF, DOCX, TXT, or RTF.",
      415,
      "UNSUPPORTED_TYPE",
      { mimeType: normalizedMimeType || "unknown" },
    );
  }

  if (PDF_MIME_TYPES.has(normalizedMimeType)) {
    throw new ResumeParseError(
      "PDF text extraction is not available on the server. Upload DOCX/TXT/RTF or update your app to extract PDF text.",
      422,
      "PDF_NEEDS_TEXT",
    );
  }

  if (DOCX_MIME_TYPES.has(normalizedMimeType)) {
    const bytes = decodeBase64ToBytes(stripped);
    const text = extractDocxText(bytes);
    if (!text.trim()) {
      throw new ResumeParseError(
        "No readable text found in DOCX file.",
        422,
        "DOCX_EMPTY_TEXT",
      );
    }
    if (text.length > MAX_TEXT_CHARS) warnings.push("TEXT_TRUNCATED");
    return {
      mode: "text",
      mimeType: normalizedMimeType,
      sizeBytes,
      warnings,
      text: truncateText(text),
    };
  }

  const textPayload = decodeBase64ToText(stripped);
  const isRtf = normalizedMimeType.includes("rtf");
  const text = isRtf ? extractRtfText(textPayload) : textPayload;
  if (!text.trim()) {
    throw new ResumeParseError(
      "No readable text found in resume.",
      422,
      "EMPTY_TEXT",
    );
  }

  if (text.length > MAX_TEXT_CHARS) warnings.push("TEXT_TRUNCATED");

  return {
    mode: "text",
    mimeType: normalizedMimeType,
    sizeBytes,
    warnings,
    text: truncateText(text),
  };
};

export const buildResumePrompt = (): string =>
  `You are a highly capable resume parser. Extract ALL structured data from the provided resume text. Return ONLY valid JSON in this exact format, with no markdown code blocks:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234 567 890",
  "target_role": "The job title or target role mentioned or inferred from the resume",
  "city": "City, State or location of the person",
  "linkedin": "LinkedIn URL if found",
  "github": "GitHub URL if found",
  "portfolio": "Portfolio or personal website URL if found",
  "twitter": "Twitter/X URL if found",
  "other_urls": ["any other URLs found in the resume"],
  "summary": "The professional summary, objective statement, or about me section. If no explicit summary exists, generate a brief 2-3 sentence professional summary from the resume content.",
  "skills_languages": "Comma-separated programming languages (e.g. Python, Java, C++, JavaScript, TypeScript)",
  "skills_frameworks": "Comma-separated frameworks, libraries, and tools (e.g. React, Node.js, Docker, Kubernetes, Git, VS Code)",
  "skills_databases": "Comma-separated databases, cloud services, and infrastructure tools (e.g. PostgreSQL, MongoDB, AWS, GCP, Firebase)",
  "skills": ["all skills as an array for backward compatibility"],
  "education": [
    {
      "institution": "University Name",
      "degree": "B.S.",
      "field": "Computer Science",
      "start_year": "2020",
      "end_year": "2024",
      "gpa": "3.8",
      "coursework": "Relevant courses comma-separated",
      "honors": "Any honors or awards"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "start_date": "01/2022",
      "end_date": "Present",
      "current": false,
      "is_current": false,
      "description": "All bullet point responsibilities and achievements for this role"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech_stack": "Technologies used comma-separated",
      "live_url": "Live demo URL if mentioned",
      "github_url": "GitHub repo URL if mentioned",
      "description": "Project description and impact"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "org": "Issuing Organization",
      "date": "Date issued MM/YYYY",
      "url": "Credential URL if mentioned"
    }
  ],
  "achievements": [
    {
      "title": "Achievement title",
      "platform": "Platform or issuer (e.g. LeetCode, HackerRank, Kaggle)",
      "date": "Date MM/YYYY if available",
      "details": "Brief details about this achievement"
    }
  ]
}

Rules:
- Extract EVERY piece of information you can find. Be thorough.
- For target_role: infer from the resume headline, objective, or most recent job title if not explicitly stated.
- For URLs: look for linkedin.com, github.com, portfolio sites, twitter.com/x.com links anywhere in the text.
- For summary: extract the professional summary/objective section. If none exists, synthesize one from the resume content.
- For skills: categorize into languages (programming languages), frameworks (frameworks, libraries, tools), and databases (databases, cloud, infrastructure). Also include a combined skills array.
- For projects: extract ALL projects mentioned with their tech stacks and descriptions.
- For certifications: extract ALL certifications, courses, and professional credentials.
- For achievements: extract competitions, awards, rankings, hackathon wins, open source contributions, etc.
- For experience: capture ALL bullet points and responsibilities for each role, preserving the full description.
- Return empty strings for missing text fields and empty arrays for missing array fields.
- For current jobs, set current and is_current to true.
- Keep dates in MM/YYYY or YYYY format when possible.
- Do NOT include any markdown formatting or code block wrappers.
- Do NOT truncate or summarize descriptions - include the full text.`;

export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  target_role: string;
  city: string;
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
  other_urls: string[];
  summary: string;
  skills: string[];
  skills_languages: string;
  skills_frameworks: string;
  skills_databases: string;
  education: Array<Record<string, string>>;
  experience: Array<Record<string, string | boolean>>;
  projects: Array<Record<string, string>>;
  certifications: Array<Record<string, string>>;
  achievements: Array<Record<string, string>>;
};

type JsonExtractionResult = {
  value: unknown;
  warnings: string[];
  repaired: boolean;
};

export const extractJsonFromText = (text: string): JsonExtractionResult => {
  let cleaned = String(text || "").trim();
  const warnings: string[] = [];

  const markdownMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (markdownMatch) {
    cleaned = markdownMatch[1].trim();
    warnings.push("CODE_FENCE_STRIPPED");
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliced = cleaned.substring(firstBrace, lastBrace + 1);
    if (sliced !== cleaned) warnings.push("JSON_TRIMMED");
    cleaned = sliced;
  }

  try {
    return { value: JSON.parse(cleaned), warnings, repaired: false };
  } catch {
    warnings.push("JSON_PARSE_FAILED");
  }

  try {
    const fixed = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
    return { value: JSON.parse(fixed), warnings, repaired: true };
  } catch {
    return { value: null, warnings, repaired: true };
  }
};

export const normalizeParsedResume = (value: unknown): ParsedResume => {
  const safe = typeof value === "object" && value !== null ? value : {};
  const obj = safe as Record<string, unknown>;

  const toString = (input: unknown) =>
    input === null || input === undefined ? "" : String(input).trim();

  const toStringArray = (input: unknown): string[] =>
    Array.isArray(input) ? input.map(toString).filter(Boolean) : [];

  const skills = toStringArray(obj.skills);

  const other_urls = toStringArray(obj.other_urls);

  const education = Array.isArray(obj.education)
    ? obj.education.map((item) => {
        const entry = (item || {}) as Record<string, unknown>;
        return {
          institution: toString(entry.institution),
          degree: toString(entry.degree),
          field: toString(entry.field),
          start_year: toString(entry.start_year),
          end_year: toString(entry.end_year),
          gpa: toString(entry.gpa),
          coursework: toString(entry.coursework),
          honors: toString(entry.honors),
        };
      })
    : [];

  const experience = Array.isArray(obj.experience)
    ? obj.experience.map((item) => {
        const entry = (item || {}) as Record<string, unknown>;
        return {
          company: toString(entry.company),
          title: toString(entry.title),
          location: toString(entry.location),
          start_date: toString(entry.start_date),
          end_date: toString(entry.end_date),
          current: Boolean(entry.current),
          is_current: Boolean(entry.is_current),
          description: toString(entry.description),
        };
      })
    : [];

  const projects = Array.isArray(obj.projects)
    ? obj.projects.map((item) => {
        const entry = (item || {}) as Record<string, unknown>;
        return {
          name: toString(entry.name),
          tech_stack: toString(entry.tech_stack),
          live_url: toString(entry.live_url),
          github_url: toString(entry.github_url),
          description: toString(entry.description),
        };
      })
    : [];

  const certifications = Array.isArray(obj.certifications)
    ? obj.certifications.map((item) => {
        const entry = (item || {}) as Record<string, unknown>;
        return {
          name: toString(entry.name),
          org: toString(entry.org),
          date: toString(entry.date),
          url: toString(entry.url),
        };
      })
    : [];

  const achievements = Array.isArray(obj.achievements)
    ? obj.achievements.map((item) => {
        const entry = (item || {}) as Record<string, unknown>;
        return {
          title: toString(entry.title),
          platform: toString(entry.platform),
          date: toString(entry.date),
          details: toString(entry.details),
        };
      })
    : [];

  return {
    name: toString(obj.name),
    email: toString(obj.email),
    phone: toString(obj.phone),
    target_role: toString(obj.target_role),
    city: toString(obj.city),
    linkedin: toString(obj.linkedin),
    github: toString(obj.github),
    portfolio: toString(obj.portfolio),
    twitter: toString(obj.twitter),
    other_urls,
    summary: toString(obj.summary),
    skills,
    skills_languages: toString(obj.skills_languages),
    skills_frameworks: toString(obj.skills_frameworks),
    skills_databases: toString(obj.skills_databases),
    education,
    experience,
    projects,
    certifications,
    achievements,
  };
};

export const parseAiResponse = (text: string): {
  parsed: ParsedResume;
  partial: boolean;
  warnings: string[];
} => {
  const result = extractJsonFromText(text);
  const parsed = normalizeParsedResume(result.value);
  const hasAny =
    parsed.name ||
    parsed.email ||
    parsed.phone ||
    parsed.summary ||
    parsed.skills.length ||
    parsed.education.length ||
    parsed.experience.length ||
    parsed.projects.length ||
    parsed.certifications.length ||
    parsed.achievements.length;
  const warnings = [...result.warnings];
  if (!hasAny) warnings.push("EMPTY_PARSED_RESULT");
  const partial = result.repaired || !hasAny;
  return { parsed, partial, warnings };
};

export const truncateLogText = (value: string, limit = 1200): string => {
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
};
