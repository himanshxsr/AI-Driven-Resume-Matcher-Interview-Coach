import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { AnalysisResult } from "@/lib/validations";

const analysisOutputSchema = z.object({
  matchScore: z.number().min(0).max(100).describe("Overall resume–job fit score 0–100"),
  missingKeywords: z.array(z.string()).describe("Important keywords/skills from the JD not clearly present in the resume"),
  strengths: z.array(z.string()).describe("Resume strengths relevant to the job"),
  suggestedInterviewQuestions: z.array(z.string()).describe("3–5 suggested interview questions based on gaps or strengths"),
});

export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;

const SYSTEM_PROMPT = `You are an expert recruiter and career coach. Analyze the candidate's resume against the job description.
Return a JSON object with:
- matchScore: number 0–100 (overall fit)
- missingKeywords: array of important JD keywords/skills not clearly in the resume
- strengths: array of resume strengths relevant to this job
- suggestedInterviewQuestions: 3–5 interview questions (mix of strength-based and gap-based)
Be concise and actionable. Use short strings for arrays.`;

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.2,
  }).withStructuredOutput(analysisOutputSchema);

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `## Job Description\n${jobDescription}\n\n## Resume\n${resumeText.slice(0, 12000)}`
    ),
  ]);

  return response as AnalysisResult;
}
