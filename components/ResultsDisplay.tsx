"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/validations";

export interface ResultsDisplayProps {
  result: AnalysisResult;
  className?: string;
}

function CircularScore({ score, className }: { score: number; className?: string }) {
  const size = 140;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="text-3xl font-bold tabular-nums">{score}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        Match score
      </span>
    </div>
  );
}

function ListSection({
  title,
  items,
  variant = "default",
}: {
  title: string;
  items: string[];
  variant?: "default" | "muted";
}) {
  if (!items.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul
          className={cn(
            "list-disc space-y-1 pl-5 text-sm",
            variant === "muted" && "text-muted-foreground"
          )}
        >
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ResultsDisplay({ result, className }: ResultsDisplayProps) {
  return (
    <div
      className={cn("space-y-8", className)}
      role="region"
      aria-label="Analysis results"
    >
      <div className="flex flex-col items-center">
        <CircularScore score={result.matchScore} />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <ListSection title="Strengths" items={result.strengths} />
        <ListSection
          title="Missing keywords"
          items={result.missingKeywords}
          variant="muted"
        />
      </div>

      <ListSection
        title="Suggested interview questions"
        items={result.suggestedInterviewQuestions}
      />
    </div>
  );
}
