"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateResumeFile } from "@/lib/validations";
import type { AnalysisResult } from "@/lib/validations";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const canSubmit =
    file &&
    jobDescription.trim().length > 0 &&
    !loading &&
    validateResumeFile(file).ok;

  async function handleAnalyze() {
    if (!file || !jobDescription.trim() || loading) return;
    const fileCheck = validateResumeFile(file);
    if (!fileCheck.ok) {
      setFileError(fileCheck.error);
      return;
    }
    setFileError(null);
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription.trim());

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      setResult(data as AnalysisResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Resume Matcher & Interview Coach
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload your resume and paste a job description to get a match score
            and suggested interview questions.
          </p>
        </header>

        <section className="space-y-6">
          <div>
            <Label htmlFor="jd">Job description</Label>
            <Textarea
              id="jd"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={loading}
              className="mt-2 min-h-[140px] resize-y"
              rows={5}
            />
          </div>

          <div>
            <Label className="mb-2 block">Resume (PDF)</Label>
            <FileUpload
              value={file}
              onChange={(f) => {
                setFile(f);
                setFileError(null);
              }}
              error={fileError ?? undefined}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!canSubmit}
            className="w-full sm:w-auto"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </Button>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {result && (
          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold">Results</h2>
            <ResultsDisplay result={result} />
          </section>
        )}
      </div>
    </div>
  );
}
