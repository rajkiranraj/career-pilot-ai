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
import AIRoadmap from "./pages/AIRoadmap";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import LoaderScreen from "./components/LoaderScreen";

import MockInterview from "./pages/MockInterview";

const AppRoutes = () => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const showLoader = showSplash || loading;

  return (
    <>
      {showLoader && (
        <LoaderScreen
          overlay
          label={
            showSplash ? "Warming up CareerPilot..." : "Checking session..."
          }
        />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/interview" element={<InterviewPrep />} />
            <Route path="/interview/mock" element={<MockInterview />} />
            <Route path="/ai-cover-letter" element={<CoverLetterGenerator />} />
            <Route
              path="/ai-cover-letter/:id"
              element={<CoverLetterGenerator />}
            />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/ats-analyzer" element={<ATSAnalyzer />} />
            <Route path="/ai-roadmap" element={<AIRoadmap />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
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
