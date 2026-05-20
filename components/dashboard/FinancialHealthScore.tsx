"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialHealthScoreProps {
  score: number;
}

export function FinancialHealthScore({ score }: FinancialHealthScoreProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const offset = circumference - progress;

  const getColor = () => {
    if (clampedScore >= 80) return "#22c55e";
    if (clampedScore >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getLabel = () => {
    if (clampedScore >= 80) return "Excellent";
    if (clampedScore >= 60) return "Good";
    if (clampedScore >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-2">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="10"
            />
            {/* Progress */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{clampedScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div
          className={cn(
            "mt-2 px-3 py-1 rounded-full text-sm font-medium",
            clampedScore >= 80 && "bg-green-500/10 text-green-500",
            clampedScore >= 60 && clampedScore < 80 && "bg-yellow-500/10 text-yellow-500",
            clampedScore < 60 && "bg-destructive/10 text-destructive"
          )}
        >
          {getLabel()}
        </div>
      </CardContent>
    </Card>
  );
}
