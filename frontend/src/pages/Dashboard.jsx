import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIndustryInsights } from "../services/DashboardService";
import { getOnboardingStatus } from "../services/UserService";
import DashboardView from "../components/DashboardView";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import LoaderScreen from "../components/LoaderScreen";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user.industry) {
      navigate("/onboarding", { replace: true });
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setError("");
        const onboardingResponse = await getOnboardingStatus();

        if (!onboardingResponse?.success) {
          throw new Error(
            onboardingResponse?.message || "Unable to load user profile state.",
          );
        }

        if (!onboardingResponse.data?.isOnboarded) {
          if (!cancelled) navigate("/onboarding", { replace: true });
          return;
        }

        const insightsResponse = await getIndustryInsights();

        if (!insightsResponse?.success) {
          throw new Error(
            insightsResponse?.message || "Unable to load dashboard insights.",
          );
        }

        if (!cancelled) setInsights(insightsResponse.data || null);
      } catch (error) {
        console.error("Error loading dashboard:", error);

        if (error?.status === 401) {
          if (!cancelled) navigate("/login", { replace: true });
          return;
        }

        if (error?.status === 403) {
          if (!cancelled)
            setError(
              "Your account must be verified before accessing the dashboard.",
            );
          return;
        }

        if (!cancelled)
          setError(
            error?.message || "Unable to load dashboard data right now.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  if (authLoading || (loading && user)) {
    return <LoaderScreen label="Loading insights..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-white/70 space-y-6">
        <p>{error}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button type="button" onClick={() => navigate("/onboarding?edit=1")}>
            Update Industry
          </Button>
          <Button type="button" onClick={() => navigate(0)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="container mx-auto py-12 text-center text-white/60 space-y-6">
        <p>
          Insights are not available yet. Complete onboarding and try again
          shortly.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button type="button" onClick={() => navigate("/onboarding?edit=1")}>
            Update Industry
          </Button>
          <Button type="button" onClick={() => navigate(0)}>
            Retry Insights
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <DashboardView insights={insights} userLocation={user.location} />
    </div>
  );
};

export default Dashboard;
