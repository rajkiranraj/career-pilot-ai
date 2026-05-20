# 🚀 CareerPilot AI — AI-Powered Career Assistant Platform

> **An advanced, production-grade career development ecosystem that automates and optimizes your job preparation journey—from resume enhancement and ATS scoring to adaptive mock interviews and interactive learning roadmaps.**

[![Node Version](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Laravel Version](https://img.shields.io/badge/Laravel-11+-red?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Architecture & Core Value Proposition

CareerPilot AI is built on a highly innovative, flexible **Dual-Backend Mode Switching** framework. With a simple environment variable toggle, the application dynamically pivots its persistence and security layer between **Supabase Serverless Cloud** and a robust **Laravel 11 REST API**.

*   **Adaptive Security**: Leverages Supabase Row-Level Security (RLS) or Laravel Sanctum cookies-based session state.
*   **High-Fidelity AI Orchestration**: Integrates directly with **NVIDIA NIM (NVIDIA Inference Microservices)** for structured JSON text analysis, self-repairing JSON pipelines, and adaptive coaching.
*   **Premium Visual Language**: Built with custom HSL-tailored colors, dynamic HSL blur overrides, and variable liquid glassmorphism.

---

## 💡 Key Platform Features

### 📄 ATS Resume Analyzer & Parser
*   **ATS Alignment Grade**: Pastes/uploads a resume alongside a job description to generate a detailed alignment score (0–100%).
*   **Keyword Optimization**: Identifies matched keywords and highlights missing high-priority industry tags.
*   **Actionable Enhancements**: Provides structural, bullet-by-bullet improvement tips.

### 🗺️ AI-Powered Learning Roadmap
*   **Visual Step Milestones**: Generates beautiful, sequencing nodes mapping skills from current levels to target job criteria.
*   **Status Tracking**: Allows marking topics dynamically as **To Do**, **In Progress**, or **Done**.
*   **Curated Resources**: Exposes real-time textbook, course, and video links tailored to each roadmap step.

### 🎙️ Adaptive Mock Interview Quiz
*   **Contextual Assessments**: Generates 10 industry-specific, highly challenging multiple-choice questions based on skills.
*   **Exploration Engine**: Delivers extensive, immediate conceptual breakdowns and explanations on demand.
*   **Performance Dashboards**: Maps scoring telemetry using beautiful radar charts and historic timelines via Recharts.

### 📄 Smart Resume Builder & Enhancer
*   **Interactive Multi-Section Editor**: Create, format, and structure experience, education, and skills.
*   **AI Action Verb Enhancer**: Inline editor that polishes description sentences to feature high-powered action verbs.
*   **Print-Ready PDF Exports**: Renders precise, clean stylesheets for instant downloads.

### ✉️ Cover Letter Generator
*   **Tone Matching**: Instantly generates complete letters adjusted for Professional, Creative, or Confident tones.

---

## 📁 Repository Structure

```
career-pilot-ai/
├── frontend/                  # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/       # Premium reusable UI cards & visualizations
│   │   ├── pages/            # Core views (Dashboard, Resume, Interview, etc.)
│   │   ├── services/         # Orchestrated API handlers with backendGuard
│   │   ├── styles/           # Global theme sheets & print typography
│   │   └── utils/            # ATS scorer and formatting utilities
│   └── package.json
├── backend/                   # Laravel 11 REST API Self-Hosted Backend
│   ├── app/
│   │   ├── Http/Controllers/ # REST endpoints mapping database persistence
│   │   └── Models/           # Structured user, resume, assessment schemas
│   ├── config/               # Sanctum, CORS, and mailing configurations
│   ├── database/             # Relational migrations & seed files
│   └── package.json
├── supabase/                  # Deno Edge Functions & DB Migrations
│   ├── migrations/           # PostgreSQL schemas & SQL triggers
│   └── functions/            # Serverless Edge Functions (NVIDIA NIM, Razorpay)
├── README.md                  # Project documentation
└── RAZORPAY_SETUP.md          # Dedicated payment configuration guides
```

---

## 🛠️ Step-by-Step Installation & Setup

Follow these commands to get CareerPilot AI up and running locally from scratch.

### Prerequisites
*   **Node.js**: `18.x` or higher
*   **PHP**: `8.2.x` or higher
*   **Composer**: `2.x` or higher
*   **Supabase CLI** (optional): For local edge function testing

---

### 1. Frontend Configuration

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `frontend` folder:
   ```bash
   cp .env.example .env
   ```
   Provide the following parameters inside `.env`:
   ```env
   # Dual-Backend Mode: "supabase" OR "laravel"
   VITE_BACKEND_MODE=supabase

   # Supabase Cloud Project Configuration (Needed for Supabase Mode)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # API Base URL (Needed for Laravel Mode)
   VITE_API_URL=http://localhost:8000
   ```
4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will be active at `http://localhost:5173`.

---

### 2. Laravel Backend Configuration (If using `VITE_BACKEND_MODE=laravel`)

1. **Navigate to the backend directory**:
   ```bash
   cd ../backend
   ```
2. **Install Composer dependencies**:
   ```bash
   composer install
   ```
3. **Configure Local Environment**:
   ```bash
   cp .env.example .env
   ```
   Configure your local relational database settings in `.env` (MySQL or PostgreSQL):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=career_pilot
   DB_USERNAME=root
   DB_PASSWORD=
   
   FRONTEND_URL=http://localhost:5173
   ```
4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```
5. **Run DB Migrations**:
   ```bash
   php artisan migrate
   ```
6. **Start the Laravel Server**:
   ```bash
   php artisan serve
   ```
   The backend REST API will be active at `http://localhost:8000`.

---

### 3. Supabase CLI & Edge Functions (If using `VITE_BACKEND_MODE=supabase`)

To serve and test the edge functions locally:
1. **Initialize and Login**:
   ```bash
   supabase login
   ```
2. **Launch Edge Functions locally**:
   ```bash
   supabase functions serve --env-file ./supabase/.env
   ```

Make sure your serverless functions `.env` includes the necessary AI tokens:
```env
NVIDIA_API_KEY=your-nvidia-nim-inference-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

---

## ⚡ Available Development Scripts

Inside the `frontend` folder, you can run:

*   `npm run dev`: Starts the Vite dev server with Hot Module Replacement (HMR).
*   `npm run build`: Compiles production assets in less than 1 second.
*   `npm run preview`: Previews the compiled production bundle locally.
*   `npm run lint`: Analyzes workspace files for standard JS lint consistency.

---

## 🌐 Production Deployment

*   **Frontend**: Recommended to deploy on **Vercel** or **Netlify** (ensure environment variables `VITE_BACKEND_MODE` and backend endpoints are set).
*   **Laravel Backend**: Deploy on standard VPS platforms (Forge, AWS, DigitalOcean) with proper SSL configurations.
*   **Supabase Database & Edge Functions**: Deploy instantly using `supabase db push` and `supabase functions deploy`.
