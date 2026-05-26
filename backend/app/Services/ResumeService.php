<?php

namespace App\Services;

use App\Models\Resume;
use App\Models\User;

class ResumeService
{
    protected NvidiaService $nvidia;

    public function __construct(NvidiaService $nvidia)
    {
        $this->nvidia = $nvidia;
    }

    public function saveResume(User $user, string $content)
    {
        return Resume::updateOrCreate(
            ['user_id' => $user->id],
            ['content' => $content]
        );
    }

    public function getResume(User $user)
    {
        return $user->resume;
    }

    public function improveWithAI(User $user, string $current, string $type)
    {
        $prompt = "
          As an expert resume writer, improve the following {$type} description for a {$user->industry} professional.
          Make it more impactful, quantifiable, and aligned with industry standards.
          Current content: \"{$current}\"

          Requirements:
          1. Use action verbs
          2. Include metrics and results where possible
          3. Highlight relevant technical skills
          4. Keep it concise but detailed
          5. Focus on achievements over responsibilities
          6. Use industry-specific keywords

          Format the response as a single paragraph without any additional text or explanations.
        ";

        return $this->nvidia->generateContent($prompt);
    }

    public function parseResumeText(string $resumeText)
    {
        $prompt = 'You are a resume data extractor. Your ONLY job is to read the resume text provided and extract the REAL information from it into JSON.

ABSOLUTE RULES:
- ONLY use data that ACTUALLY EXISTS in the resume text below. 
- NEVER invent, fabricate, or use placeholder data.
- If a field is not found in the resume, use an empty string "" or empty array [].
- Do NOT copy example values. Every value must come from the actual resume text.
- Combine multiple bullet points for a single entry into one string, separated by newlines.

SKILL CATEGORIZATION:
- "skills_languages": Only programming/scripting languages found in the resume (like C++, JavaScript, Python, SQL, Java, TypeScript)
- "skills_frameworks": Only frameworks, libraries, tools, platforms found (like React.js, Node.js, Express.js, Tailwind CSS, Git, GitHub, Docker, VS Code, Postman, Vercel)
- "skills_databases": Only databases and cloud services found (like MongoDB, MySQL, PostgreSQL, Firebase, AWS, Redis)
- "skills": Array of any OTHER technical or CS concepts found (like Data Structures, OOPs, DBMS, OS, CN, System Design)

Return ONLY valid JSON with these exact keys. No markdown wrapping, no explanation text.

{
  "name": "",
  "email": "",
  "phone": "",
  "target_role": "",
  "city": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "twitter": "",
  "summary": "",
  "skills_languages": "",
  "skills_frameworks": "",
  "skills_databases": "",
  "skills": [],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startYear": "",
      "gradYear": "",
      "gpa": "",
      "coursework": "",
      "honors": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "techStack": "",
      "description": "",
      "link": "",
      "githubUrl": "",
      "liveUrl": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "link": ""
    }
  ],
  "achievements": [
    {
      "title": "",
      "platform": "",
      "date": "",
      "details": ""
    }
  ]
}

INSTRUCTIONS FOR EACH FIELD:
- name: Extract the person full name from the resume header
- email: Extract their email address
- phone: Extract their phone number
- target_role: Extract from the headline/subtitle under their name (e.g. "Software Development Engineer | Full Stack Developer")
- city: Extract their city/location
- linkedin/github/portfolio/twitter: Extract URLs or profile mentions. If they just say "LinkedIn" or "GitHub" without a URL, put ""
- summary: Extract the professional summary section verbatim
- skills_*: Categorize ALL skills listed in the resume into the correct category
- education: Extract EVERY education entry with institution name, degree, field, years, GPA
- experience: Extract EVERY work experience with company, title, dates, and ALL bullet points as description
- projects: Extract EVERY project with name, technologies used as techStack, and ALL bullet points as description
- certifications: Extract any certifications mentioned
- achievements: Extract EVERY achievement/accomplishment mentioned

NOW EXTRACT FROM THIS RESUME:
"""
' . $resumeText . '
"""';

        $parsed = $this->nvidia->generateJson($prompt, [
            'max_tokens' => 8192,
            'temperature' => 0.02,
        ]);

        return $parsed;
    }
}
