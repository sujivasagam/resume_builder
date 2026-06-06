import { ChangeEvent, useState } from "react";
import { analyzeImport, analyzeScreenshot } from "../services/ai/gemini";
import { TemplateId } from "../types";

interface Props {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onTemplateSuggestion: (templateId: TemplateId) => void;
}

export function ImportCenter({ jobDescription, onJobDescriptionChange, onTemplateSuggestion }: Props) {
  const [profileLink, setProfileLink] = useState("");
  const [importNotes, setImportNotes] = useState("");
  const [result, setResult] = useState("");

  const handleTextFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const analysis = await analyzeImport(text, "resume upload");
    setResult(
      `Detected sections: ${analysis.detectedSections.join(", ")}\nHighlights: ${analysis.extractedHighlights.join(" | ")}\nNotes: ${analysis.parsingNotes.join(" | ")}`
    );
  };

  const handleScreenshot = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const suggestion = await analyzeScreenshot(file.name, file.type.includes("pdf") ? "document" : "image", importNotes);
    onTemplateSuggestion(suggestion.templateId);
    setResult(
      `Template suggestion: ${suggestion.templateId}\nPalette: ${suggestion.palette.join(", ")}\nTypography: ${suggestion.typography.join(", ")}\nWhy: ${suggestion.rationale.join(" | ")}`
    );
  };

  return (
    <section className="studio-panel space-y-5">
      <div>
        <p className="eyebrow">Import Hub</p>
        <h2 className="section-title">Upload, link, or paste</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-block">
          Resume Upload
          <input className="input-field py-3" type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleTextFile} />
        </label>
        <label className="field-block">
          Profile Link
          <input
            className="input-field"
            placeholder="LinkedIn, Indeed, Naukri, GitHub, portfolio"
            value={profileLink}
            onChange={(event) => setProfileLink(event.target.value)}
          />
        </label>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Profile URLs are treated as intake helpers. For LinkedIn, Indeed, and Naukri, the reliable path is to upload a resume or exported PDF instead of promising direct scraping.
      </div>

      <label className="field-block">
        Job Description
        <textarea className="input-field min-h-32" value={jobDescription} onChange={(event) => onJobDescriptionChange(event.target.value)} />
      </label>

      <label className="field-block">
        Create Template From Screenshot
        <textarea
          className="input-field min-h-24"
          placeholder="Optional notes: minimalist, navy palette, strong sidebar, ATS feel..."
          value={importNotes}
          onChange={(event) => setImportNotes(event.target.value)}
        />
        <input className="input-field py-3" type="file" accept="image/*,.pdf" onChange={handleScreenshot} />
      </label>

      {result ? <pre className="rounded-3xl bg-slate-950 p-5 text-sm text-slate-100 whitespace-pre-wrap">{result}</pre> : null}
    </section>
  );
}
