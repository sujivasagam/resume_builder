import { useState } from "react";
import { ResumeDocument, ResumeVariantResult } from "../types";
import { generateCoverLetter, generateVariants, optimizeResume } from "../services/ai/gemini";

interface Props {
  resume: ResumeDocument;
  onApplySummary: (summary: string) => void;
  onApplyTemplate: (templateId: ResumeDocument["templateId"]) => void;
}

export function AIWorkbench({ resume, onApplySummary, onApplyTemplate }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [variants, setVariants] = useState<ResumeVariantResult[]>([]);
  const jobDescription = resume.jobDescription;

  const runOptimization = async () => {
    setLoading("optimize");
    try {
      const result = await optimizeResume(resume, jobDescription);
      setOptimization(
        `ATS Score: ${result.atsScore}\nKeywords: ${result.keywordCoverage.join(", ")}\nMissing: ${result.missingKeywords.join(", ")}\n\nEnhanced Summary:\n${result.enhancedSummary}\n\nImproved bullets:\n- ${result.improvedBullets.join("\n- ")}`
      );
      onApplySummary(result.enhancedSummary);
      onApplyTemplate(result.suggestedTemplateId);
    } finally {
      setLoading(null);
    }
  };

  const runCoverLetter = async () => {
    setLoading("cover");
    try {
      const result = await generateCoverLetter(resume, jobDescription);
      setCoverLetter(`${result.subjectLine}\n\n${result.body}`);
    } finally {
      setLoading(null);
    }
  };

  const runVariants = async () => {
    setLoading("variants");
    try {
      setVariants(await generateVariants(resume));
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="studio-panel space-y-5">
      <div>
        <p className="eyebrow">Gemini Workbench</p>
        <h2 className="section-title">ATS, cover letter, and role variants</h2>
      </div>

      <label className="field-block">
        Job Description
        <textarea className="input-field min-h-36" value={resume.jobDescription} readOnly />
      </label>

      <div className="flex flex-wrap gap-3">
        <button className="primary-button" onClick={runOptimization} disabled={!jobDescription || !!loading}>
          {loading === "optimize" ? "Optimizing..." : "Optimize Resume"}
        </button>
        <button className="secondary-button" onClick={runCoverLetter} disabled={!jobDescription || !!loading}>
          {loading === "cover" ? "Generating..." : "Generate Cover Letter"}
        </button>
        <button className="secondary-button" onClick={runVariants} disabled={!!loading}>
          {loading === "variants" ? "Generating..." : "Generate Resume Variants"}
        </button>
      </div>

      {optimization ? <pre className="rounded-3xl bg-slate-950 p-5 text-sm text-slate-100 whitespace-pre-wrap">{optimization}</pre> : null}
      {coverLetter ? <pre className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 whitespace-pre-wrap">{coverLetter}</pre> : null}
      {variants.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {variants.map((variant) => (
            <article key={variant.role} className="rounded-3xl border border-slate-200 p-4">
              <h3 className="font-semibold">{variant.role}</h3>
              <p className="mt-2 text-sm text-slate-600">{variant.headline}</p>
              <p className="mt-3 text-sm text-slate-500">{variant.summary}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
