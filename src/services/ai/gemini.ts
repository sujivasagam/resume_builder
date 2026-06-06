import {
  AiOptimizationResult,
  CoverLetterResult,
  ImportAnalysisResult,
  ResumeDocument,
  ResumeVariantResult,
  ScreenshotTemplateResult,
  TemplateId,
} from "../../types";

async function requestAi<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/tailor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "AI request failed");
  }

  return response.json() as Promise<T>;
}

export function optimizeResume(resume: ResumeDocument, jobDescription: string) {
  return requestAi<AiOptimizationResult>({
    action: "optimize",
    resume,
    jobDescription,
  });
}

export function generateCoverLetter(resume: ResumeDocument, jobDescription: string) {
  return requestAi<CoverLetterResult>({
    action: "cover-letter",
    resume,
    jobDescription,
  });
}

export function generateVariants(resume: ResumeDocument) {
  return requestAi<ResumeVariantResult[]>({
    action: "variants",
    resume,
  });
}

export function analyzeImport(sourceText: string, context: string) {
  return requestAi<ImportAnalysisResult>({
    action: "import-analysis",
    sourceText,
    context,
  });
}

export function analyzeScreenshot(fileName: string, orientation: string, notes: string) {
  return requestAi<ScreenshotTemplateResult>({
    action: "screenshot-template",
    fileName,
    orientation,
    notes,
  });
}

export function fallbackTemplateForRole(targetRole: string): TemplateId {
  const lower = targetRole.toLowerCase();
  if (lower.includes("engineer") || lower.includes("developer")) return "technical";
  if (lower.includes("project") || lower.includes("program")) return "executive";
  if (lower.includes("creative") || lower.includes("design")) return "creative";
  return "modern";
}
