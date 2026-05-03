# 🚀 CareerPilot AI - AI-Powered Career Assistant Platform

> **Automate and optimize your entire job preparation journey—from job discovery to interview mastery—with intelligent agents and personalized recommendations.**

![Node Version](https://img.shields.io/badge/Node.js-18+-green)
![React Version](https://img.shields.io/badge/React-19+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)

## 🌟 Project Overview

CareerPilot AI is a comprehensive career development platform that leverages cutting-edge AI and intelligent agents to transform how professionals prepare for job opportunities. From automated job discovery to personalized interview coaching, CareerPilot automates and optimizes every step of the job preparation process.

**Live Demo:** [career-pilot-ai-nu.vercel.app](https://career-pilot-ai-nu.vercel.app)

---

## 💡 What Makes CareerPilot Stand Out

### 🤖 **AI-Powered Intelligent Agents**
- Autonomous job discovery and matching agents
- Real-time resume optimization using generative AI
- Personalized interview preparation with interactive mock interviews
- Dynamic skill gap analysis and improvement recommendations

### 🎯 **End-to-End Career Optimization**
- **Job Discovery**: AI agents continuously scan and recommend relevant opportunities
- **Resume Enhancement**: Automatic optimization based on job descriptions
- **Interview Prep**: AI-powered mock interviews with real-time feedback
- **Career Insights**: Personalized career progression recommendations

### 🎨 **Modern, Responsive UI**
- Sleek, interactive interface with smooth animations
- Real-time progress tracking and analytics
- Beautiful data visualizations for career metrics
- Mobile-optimized responsive design

### ⚡ **Performance & Scalability**
- Built on modern tech stack with emphasis on speed
- Seamless real-time data synchronization
- Cloud-based infrastructure ready for scale

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose | Version |
|---|---|---|
| **React** | UI Framework | 19.2.4 |
| **Vite** | Build Tool & Dev Server | 8.0.4 |
| **TypeScript** | Type Safety | Latest |
| **TailwindCSS** | Utility-first CSS | 4.2.2 |
| **Radix UI** | Headless UI Components | Latest |

### **Styling & Animation**
| Technology | Purpose |
|---|---|
| **Framer Motion** | Smooth animations & transitions |
| **GSAP** | Advanced timeline animations |
| **Three.js** | 3D graphics & visualizations |
| **Lenis** | Smooth scrolling |
| **Lucide React** | Beautiful icon library |

### **Form & Data Handling**
| Technology | Purpose |
|---|---|
| **React Hook Form** | Performant form state management |
| **Zod** | TypeScript-first schema validation |
| **@hookform/resolvers** | Form validation resolvers |

### **Data & Storage**
| Technology | Purpose |
|---|---|
| **Supabase** | PostgreSQL database & real-time API |
| **@supabase/supabase-js** | Supabase client library |

### **AI & LLM Integration**
| Technology | Purpose |
|---|---|
| **Google Gemini API** | Advanced AI capabilities for career coaching |

### **Utilities & Libraries**
| Technology | Purpose |
|---|---|
| **Axios** | HTTP client for API calls |
| **React Router** | Client-side routing |
| **Recharts** | Chart & analytics visualization |
| **React Markdown** | Markdown rendering |
| **Sonner** | Toast notifications |
| **html2pdf.js** | PDF generation |
| **date-fns** | Date utilities |
| **class-variance-authority** | CSS-in-JS utilities |

### **Development Tools**
| Technology | Purpose |
|---|---|
| **ESLint** | Code linting |
| **Vite Plugins** | React HMR & optimization |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajkiranraj/career-pilot-ai.git
   cd career-pilot-ai
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Create environment configuration**
   
   Create a `.env` file in the root directory with the following variables:

   ```env
   # === Supabase Configuration ===
   # Get these from: https://supabase.com/dashboard → Project → Settings → API
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
career-pilot-ai/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API & external service integrations
│   │   ├── styles/          # Global styles
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   ├── index.html
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── package.json
├── supabase/                # Supabase database & config
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
├── .env.example             # Environment variables template
└── README.md                # Project documentation
```

---

## 🎯 Key Features

### 📋 **Job Discovery**
- AI-powered job matching algorithm
- Personalized recommendations based on skills
- Real-time job market insights

### 💼 **Resume Optimization**
- AI-driven resume enhancement
- ATS (Applicant Tracking System) optimization
- Instant feedback and suggestions

### 🎤 **Interview Preparation**
- Interactive AI mock interviews
- Real-time performance feedback
- Question bank with solutions
- Industry-specific interview patterns

### 📊 **Career Analytics**
- Progress tracking dashboard
- Skill assessment reports
- Career pathway visualization
- Market insights & trends

### 🔔 **Real-time Notifications**
- Job alerts
- Application status updates
- Interview reminders

---

## 🔌 API Integration

### Supabase Integration
- Real-time database for job listings and user data
- Authentication and authorization
- Row-level security policies
- Serverless functions for backend operations

### Google Gemini API
- Advanced conversational AI for interview coaching
- Resume analysis and optimization
- Job description matching
- Personalized career recommendations

---

## 🧪 Development

### Available Scripts

```bash
# Start development server with hot module reloading
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Start production server
npm run start
```

---

## 📦 Dependencies Highlights

### Performance Optimizations
- **Vite**: Lightning-fast build and dev server
- **React 19**: Latest React features and optimizations
- **TailwindCSS v4**: Smaller bundle size with JIT compilation

### User Experience
- **Framer Motion + GSAP**: Buttery-smooth animations
- **Radix UI**: Accessible, unstyled components
- **Sonner**: Non-intrusive, beautiful notifications

### Code Quality
- **Zod**: Runtime type checking and validation
- **React Hook Form**: Minimal re-renders, better performance
- **ESLint**: Code quality and consistency

---

## 🌐 Deployment

The project is optimized for deployment on:
- **Vercel** (Recommended for frontend)
- **Netlify**
- **AWS Amplify**
- **Firebase Hosting**

Live deployment: [career-pilot-ai-nu.vercel.app](https://career-pilot-ai-nu.vercel.app)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/rajkiranraj/career-pilot-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rajkiranraj/career-pilot-ai/discussions)
- **Author**: [@rajkiranraj](https://github.com/rajkiranraj)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Google Gemini API](https://ai.google.dev)
- Database by [Supabase](https://supabase.com)
- Styled with [TailwindCSS](https://tailwindcss.com)
- Animated with [Framer Motion](https://www.framer.com/motion) & [GSAP](https://greensock.com)

---

**Happy coding! 🚀**
