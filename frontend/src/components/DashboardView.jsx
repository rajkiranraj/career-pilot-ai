import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

const DashboardView = ({ insights, userLocation }) => {
  if (!insights) return null;

  const asArray = (value) => (Array.isArray(value) ? value : []);

  const normalizedInsights = {
    salary_ranges: asArray(insights.salary_ranges ?? insights.salaryRanges),
    demand_level: insights.demand_level ?? insights.demandLevel ?? "Unknown",
    top_skills: asArray(insights.top_skills ?? insights.topSkills),
    market_outlook:
      insights.market_outlook ?? insights.marketOutlook ?? "Neutral",
    key_trends: asArray(
      insights.key_trends ?? insights.keyTrends ?? insights.industry_trends,
    ),
    recommended_skills: asArray(
      insights.recommended_skills ??
        insights.recommendedSkills ??
        insights.key_opportunities,
    ),
    updated_at: insights.updated_at,
    next_update: insights.next_update,
  };

  // Transform salary data for the chart
  const salaryData = normalizedInsights.salary_ranges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const outlookInfo = getMarketOutlookInfo(normalizedInsights.market_outlook);
  const OutlookIcon = outlookInfo.icon;
  const outlookColor = outlookInfo.color;

  // Format dates using date-fns
  const lastUpdatedDate = normalizedInsights.updated_at
    ? format(new Date(normalizedInsights.updated_at), "dd/MM/yyyy")
    : "N/A";
  const nextUpdateDistance = normalizedInsights.next_update
    ? formatDistanceToNow(new Date(normalizedInsights.next_update), {
        addSuffix: true,
      })
    : "N/A";

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-2">
            Industry Insights
          </h1>
          <p className="text-white/50 font-body font-light">
            Comprehensive market data for your career path
          </p>
        </div>
        <Badge
          variant="glass"
          className="text-[10px] uppercase tracking-widest px-4 py-2"
        >
          Last updated: {lastUpdatedDate}
        </Badge>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:bg-white/[0.02] transition-colors border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50">
              Market Outlook
            </CardTitle>
            <div className="liquid-glass-strong p-2 rounded-full">
              <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading italic text-white mb-1">
              {normalizedInsights.market_outlook}
            </div>
            <p className="text-xs text-white/30 font-body">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-white/[0.02] transition-colors border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50">
              Industry Demand
            </CardTitle>
            <div className="liquid-glass-strong p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading italic text-white mb-2">
              {normalizedInsights.demand_level}
            </div>
            <Progress
              value={
                normalizedInsights.demand_level === "High"
                  ? 90
                  : normalizedInsights.demand_level === "Medium"
                    ? 60
                    : 30
              }
              className="h-1 bg-white/5"
            />
          </CardContent>
        </Card>

        <Card className="hover:bg-white/[0.02] transition-colors border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50">
              Top Skills
            </CardTitle>
            <div className="liquid-glass-strong p-2 rounded-full">
              <Brain className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {normalizedInsights.top_skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[10px] bg-white/5 hover:bg-white/10 border-white/5 text-white/70"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <a 
          href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(insights.industry?.replace(/-/g, ' ') || 'jobs')}${userLocation ? `&location=${encodeURIComponent(userLocation)}` : ''}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="block cursor-pointer group"
        >
          <Card className="hover:bg-white/[0.05] transition-colors border-white/5 h-full group-hover:border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
                Key Opportunities
              </CardTitle>
              <div className="liquid-glass-strong p-2 rounded-full group-hover:bg-white/10 transition-colors">
                <BriefcaseIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading italic text-white mb-1 group-hover:scale-105 transform origin-left transition-transform">
                {normalizedInsights.recommended_skills.length}
              </div>
              <p className="text-xs text-white/30 font-body group-hover:text-white/50 transition-colors">
                Click to search jobs on LinkedIn
              </p>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-xl">Salary Ranges by Role</CardTitle>
            <CardDescription className="text-white/40">
              In thousands (k) per year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff40"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #ffffff10",
                    borderRadius: "16px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="min"
                  fill="#ffffff20"
                  radius={[0, 0, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="median"
                  fill="#ffffff"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-xl">Top Skills in Demand</CardTitle>
            <CardDescription className="text-white/40">
              Most requested competencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {normalizedInsights.top_skills.map((skill, index) => (
                <div
                  key={skill}
                  className="liquid-glass rounded-2xl px-6 py-4 flex flex-col gap-1 border border-white/5 hover:border-white/20 transition-all flex-grow basis-[calc(50%-12px)]"
                >
                  <span className="text-white font-medium">{skill}</span>
                  <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest">
                    <span>Skill Rank</span>
                    <span>#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-xl">Industry Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {normalizedInsights.key_trends.map((trend, index) => (
                <li key={index} className="flex gap-4 group">
                  <span className="font-heading italic text-white/20 text-2xl group-hover:text-white/40 transition-colors">
                    0{index + 1}
                  </span>
                  <p className="text-white/70 font-body font-light leading-relaxed pt-1">
                    {trend}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-xl">Key Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {normalizedInsights.recommended_skills.map(
                (opportunity, index) => (
                  <li key={index} className="flex gap-4 group">
                    <span className="font-heading italic text-white/20 text-2xl group-hover:text-white/40 transition-colors">
                      0{index + 1}
                    </span>
                    <p className="text-white/70 font-body font-light leading-relaxed pt-1">
                      {opportunity}
                    </p>
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
