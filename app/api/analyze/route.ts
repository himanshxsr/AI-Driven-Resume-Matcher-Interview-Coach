import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestBodySchema, validateResumeFile } from "@/lib/validations";
import { parsePdfBuffer } from "@/lib/langchain/pdf-parser";
import { analyzeResumeAgainstJob } from "@/lib/langchain/resume-analyzer";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescriptionRaw = formData.get("jobDescription") ?? "";

    const jobDescription =
      typeof jobDescriptionRaw === "string"
        ? jobDescriptionRaw.trim()
        : String(jobDescriptionRaw).trim();

    const fileCheck = validateResumeFile(resumeFile);
    if (!fileCheck.ok) {
      return NextResponse.json(
        { error: fileCheck.error },
        { status: 400 }
      );
    }

    const parsed = analyzeRequestBodySchema.safeParse({ jobDescription });
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Invalid job description";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile!.arrayBuffer());
    const resumeText = await parsePdfBuffer(buffer);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the PDF. Ensure it is a valid, text-based PDF." },
        { status: 400 }
      );
    }

    const result = await analyzeResumeAgainstJob(resumeText, parsed.data.jobDescription);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    const errName = err instanceof Error ? err.name : "";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Server is not configured for analysis (missing API key)." },
        { status: 503 }
      );
    }

    // OpenAI quota exceeded (429) or billing issue
    if (
      errName === "InsufficientQuotaError" ||
      message.includes("exceeded your current quota") ||
      message.includes("429")
    ) {
      return NextResponse.json(
        {
          error:
            "OpenAI quota exceeded. Check your plan and billing at platform.openai.com, then try again.",
        },
        { status: 503 }
      );
    }

    console.error("[POST /api/analyze]", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
