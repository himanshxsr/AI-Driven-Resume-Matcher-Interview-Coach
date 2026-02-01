import { z } from "zod";

/** Max file size for resume PDF (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf"];

/** Schema for /api/analyze request: multipart form with resume file + jobDescription */
export const analyzeRequestBodySchema = z.object({
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .max(50_000, "Job description too long"),
});

/** Runtime validation for the resume file (not in Zod form schema) */
export function validateResumeFile(file: File | null): { ok: true } | { ok: false; error: string } {
  if (!file) return { ok: false, error: "Resume file is required" };
  if (!ALLOWED_TYPES.includes(file.type))
    return { ok: false, error: "Only PDF files are allowed" };
  if (file.size > MAX_FILE_SIZE)
    return { ok: false, error: "File too large (max 5MB)" };
  return { ok: true };
}

/** Response shape from resume analyzer (and API) */
export const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  suggestedInterviewQuestions: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
