import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment) => ({
        date: format(new Date(assessment.created_at), "MMM dd"),
        score: assessment.quiz_score,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <Card className="border-white/5">
      <CardHeader className="text-left">
        <CardTitle className="text-2xl font-heading italic text-white">
          Performance Trend
        </CardTitle>
        <CardDescription className="text-white/40 font-body">
          Your quiz scores over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff10"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#ffffff40"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
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
              <Line
                type="monotone"
                dataKey="score"
                stroke="#ffffff"
                strokeWidth={3}
                dot={{ fill: "#ffffff", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
