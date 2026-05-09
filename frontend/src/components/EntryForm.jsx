import { useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, X } from "lucide-react";
import { improveResumeContent } from "../services/ResumeService";
import { toast } from "sonner";
import { LoadingBreadcrumb } from "./ui/animated-loading-svg-text-shimmer";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = parse(dateString, "yyyy-MM", new Date());
    return format(date, "MMM yyyy");
  } catch (e) {
    return dateString;
  }
};

export function EntryForm({ type, entries = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    location: "",
    link: "",
    startDate: "",
    endDate: "",
    description: "",
    current: false,
  });

  const [errors, setErrors] = useState({});

  const getLabels = () => {
    if (type === "Education") {
      return {
        title: "Degree/Certificate",
        org: "School/University",
        titlePlaceholder: "e.g. B.S. Computer Science",
        orgPlaceholder: "e.g. IIT Bombay",
      };
    }
    if (type === "Project") {
      return {
        title: "Project Name",
        org: "Role/Tech Stack",
        titlePlaceholder: "e.g. Portfolio Website",
        orgPlaceholder: "e.g. Full Stack Developer (React, Node.js)",
      };
    }
    return {
      title: "Job Title",
      org: "Company",
      titlePlaceholder: "e.g. Senior Software Engineer",
      orgPlaceholder: "e.g. TCS",
    };
  };

  const labels = getLabels();

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
    // Clear error for the field being typed in
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = `${labels.title} is required`;
    if (!formData.organization)
      newErrors.organization = `${labels.org} is required`;
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.current && !formData.endDate) {
      newErrors.endDate =
        "End date is required unless this is your current position";
    }
    if (!formData.description)
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const formattedEntry = {
      ...formData,
      startDate: formatDisplayDate(formData.startDate),
      endDate: formData.current ? "" : formatDisplayDate(formData.endDate),
    };

    onChange([...entries, formattedEntry]);

    setFormData({
      title: "",
      organization: "",
      location: "",
      link: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    });
    setErrors({});
    setIsAdding(false);
  };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const handleImproveDescription = async () => {
    if (!formData.description) {
      toast.error("Please enter a description first");
      return;
    }

    setIsImproving(true);
    try {
      const response = await improveResumeContent(
        formData.description,
        type.toLowerCase(),
      );
      if (response.success) {
        setFormData((prev) => ({ ...prev, description: response.data }));
        setErrors((prev) => ({ ...prev, description: null }));
        toast.success("Description improved successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to improve description");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {entries.map((item, index) => (
          <Card
            key={index}
            className="hover:bg-white/2 transition-colors border-white/5"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-heading italic text-white">
                {item.title} @ {item.organization}
              </CardTitle>
              <Button
                variant="glass"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 mb-4">
                <p className="text-xs text-white/40 font-body uppercase tracking-widest text-left">
                  {item.current
                    ? `${item.startDate} - Present`
                    : `${item.startDate} - ${item.endDate}`}
                </p>
                {item.location && (
                  <p className="text-xs text-white/40 font-body text-left">
                    📍 {item.location}
                  </p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 font-body text-left w-fit"
                  >
                    🔗 {item.link}
                  </a>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap text-left text-white/70 font-body font-light leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdding ? (
        <Card className="border-white/10 bg-white/2">
          <CardHeader>
            <CardTitle className="text-xl">Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">
                  {labels.title}
                </Label>
                <Input
                  name="title"
                  placeholder={labels.titlePlaceholder}
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 text-left ml-4">
                    {errors.title}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">
                  {labels.org}
                </Label>
                <Input
                  name="organization"
                  placeholder={labels.orgPlaceholder}
                  value={formData.organization}
                  onChange={handleInputChange}
                />
                {errors.organization && (
                  <p className="text-sm text-red-500 text-left ml-4">
                    {errors.organization}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {type === "Experience" && (
                <div className="space-y-2">
                  <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">
                    Location
                  </Label>
                  <Input
                    name="location"
                    placeholder="e.g. Bengaluru, KA (or Remote)"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {type === "Project" && (
                <div className="space-y-2">
                  <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">
                    Project Link URL
                  </Label>
                  <Input
                    name="link"
                    placeholder="e.g. https://github.com/arjunsharma/project"
                    value={formData.link}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">
                  Start Date
                </Label>
                <Input
                  type="month"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 text-left ml-4">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 uppercase tracking-widest text-[10px] ml-4">
                  End Date
                </Label>
                <Input
                  type="month"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={formData.current}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 text-left ml-4">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <input
                type="checkbox"
                id="current"
                name="current"
                checked={formData.current}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/20"
              />
              <label
                htmlFor="current"
                className="text-sm font-body text-white/70"
              >
                Current {type === "Education" ? "Program" : "Position"}
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <label className="text-xs uppercase tracking-widest text-white/50">
                  Description
                </label>
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  onClick={handleImproveDescription}
                  disabled={isImproving}
                  className="rounded-full"
                >
                  {isImproving ? (
                    <LoadingBreadcrumb text="Cooking" className="text-xs" white />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="h-40"
                placeholder={
                  type === "Education"
                    ? "Describe coursework, achievements, GPA..."
                    : "Describe your key responsibilities and achievements..."
                }
              />
              {errors.description && (
                <p className="text-sm text-red-500 text-left ml-4">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setErrors({});
                }}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="glass-strong"
                onClick={handleAdd}
                className="rounded-full px-8"
              >
                Add {type}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="glass"
          className="w-full rounded-2xl py-8 border-dashed border-white/20 hover:border-white/40 text-white/50 hover:text-white transition-all"
          onClick={() => setIsAdding(true)}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">+</span>
            <span className="text-xs uppercase tracking-widest">
              Add {type}
            </span>
          </div>
        </Button>
      )}
    </div>
  );
}
