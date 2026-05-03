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
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

import MockInterview from "./pages/MockInterview";

function App() {
  return (
    <Router>
      <AuthProvider>
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
              <Route
                path="/ai-cover-letter"
                element={<CoverLetterGenerator />}
              />
              <Route
                path="/ai-cover-letter/:id"
                element={<CoverLetterGenerator />}
              />
              <Route path="/settings" element={<ProfileSettings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
