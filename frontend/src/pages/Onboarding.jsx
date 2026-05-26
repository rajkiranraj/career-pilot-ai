import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { onboardingSchema } from "../lib/schema";
import { updateUser, getOnboardingStatus } from "../services/UserService";
import { industries } from "../data/industries";
import { useAuth } from "../context/AuthContext";
import LoaderScreen from "../components/LoaderScreen";
import { TubesBackground } from "../components/ui/TubesBackground";

const Onboarding = () => {
  const { user, loading: authLoading, checkUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      experience: "0",
      skills: "",
      location: "",
    },
  });

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) return;

    // If not logged in, redirect to login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Only check onboarding status once, not on every user object change
    let cancelled = false;
    const checkStatus = async () => {
      try {
        const { data } = await getOnboardingStatus();
        if (!cancelled && data?.isOnboarded && !isEditMode) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkStatus();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isEditMode]);

  if (authLoading) {
    return <LoaderScreen label="Loading your profile..." />;
  }

  const onSubmit = async (values) => {
    setUpdateLoading(true);
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;

      const parsedSkills = Array.isArray(values.skills)
        ? values.skills.map((skill) => String(skill).trim()).filter(Boolean)
        : typeof values.skills === "string"
          ? values.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [];

      // Omit virtual field before payload submission
      const { subIndustry, ...restValues } = values;

      const response = await updateUser({
        ...restValues,
        industry: formattedIndustry,
        skills: parsedSkills,
      });

      if (response.success) {
        // Refresh user state in AuthContext so Dashboard sees the updated industry
        await checkUser();
        toast.success(
          isEditMode
            ? "Profile updated successfully!"
            : "Profile completed successfully!",
        );
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      console.error("Onboarding error:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const watchIndustry = watch("industry");

  return (
    <div className="relative flex items-center justify-center bg-background py-10 min-h-screen overflow-hidden">
      {/* Subtle ambient tubes */}
      <div className="absolute inset-0 z-0">
        <TubesBackground enableClickInteraction={false} opacity={0.25} />
      </div>

      <Card className="relative z-10 w-full max-w-lg mx-2">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">
            {isEditMode ? "Update Your Profile" : "Complete Your Profile"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your industry details to regenerate personalized insights."
              : "Select your industry to get personalized career insights and recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value),
                  );
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  onValueChange={(value) => setValue("subIndustry", value)}
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className="text-sm text-red-500">
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Bengaluru, KA or Remote"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple skills with commas
              </p>
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
