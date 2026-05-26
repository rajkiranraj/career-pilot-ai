import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import ResumeBuilder from "./pages/ResumeBuilder";
import InterviewPrep from "./pages/InterviewPrep";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import ProfileSettings from "./pages/ProfileSettings";
import ATSAnalyzer from "./pages/ATSAnalyzer";
import RemoteJobs from "./pages/RemoteJobs";
import AIRoadmap from "./pages/AIRoadmap";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import LoaderScreen from "./components/LoaderScreen";

import NotFound from "./pages/NotFound";

const SPLASH_MS = 600;

const AppRoutes = () => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss as soon as BOTH splash minimum has passed AND auth is done
  const showLoader = showSplash || loading;

  return (
    <>
      {showLoader && (
        <LoaderScreen
          overlay
          label={showSplash ? "Initializing CareerPilot..." : "Checking session..."}
        />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/interview" element={<InterviewPrep />} />
            <Route path="/ai-cover-letter" element={<CoverLetterGenerator />} />
            <Route
              path="/ai-cover-letter/:id"
              element={<CoverLetterGenerator />}
            />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/ats-analyzer" element={<ATSAnalyzer />} />
            <Route path="/ai-roadmap" element={<AIRoadmap />} />
            <Route path="/remote-jobs" element={<RemoteJobs />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
