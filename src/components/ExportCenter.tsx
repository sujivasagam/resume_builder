import { useState } from "react";
import { ResumeDocument } from "../types";
import { exportResumeAsDoc, exportResumeAsDocx, exportResumeAsInteractiveHtml, exportResumeAsPdf, exportResumeAsPng } from "../services/export";

interface Props {
  resume: ResumeDocument;
}

export function ExportCenter({ resume }: Props) {
  const [status, setStatus] = useState<string>("");

  const handlePdf = async () => {
    const element = document.getElementById("resume-preview-sheet");
    if (!element) return;
    try {
      setStatus('Opening print-ready PDF window...');
      await exportResumeAsPdf(element, `${resume.name}.pdf`);
      setStatus('Choose "Save as PDF" in the print window.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PDF export failed.");
    }
  };

  const handlePng = async () => {
    const element = document.getElementById("resume-preview-sheet");
    if (!element) return;
    try {
      setStatus("Generating PNG...");
      await exportResumeAsPng(element, `${resume.name}.png`);
      setStatus("PNG downloaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PNG export failed.");
    }
  };

  const handleInteractiveHtml = () => {
    const element = document.getElementById("resume-preview-sheet");
    if (!element) return;
    exportResumeAsInteractiveHtml(element, `${resume.name}.html`);
    setStatus("Interactive HTML downloaded. Open it in a browser for the closest match to the preview.");
  };

  return (
    <section className="studio-panel export-panel space-y-5">
      <div>
        <p className="eyebrow">Export Center</p>
        <h2 className="section-title">PDF, DOC, DOCX, PNG, HTML</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <button className="primary-button export-button" onClick={handleInteractiveHtml}>
          Export Interactive HTML
        </button>
        <button className="primary-button export-button" onClick={handlePdf}>
          Export PDF
        </button>
        <button className="secondary-button export-button" onClick={() => exportResumeAsDocx(resume)}>
          Export DOCX
        </button>
        <button className="secondary-button export-button" onClick={() => exportResumeAsDoc(resume)}>
          Export DOC
        </button>
        <button className="secondary-button export-button" onClick={handlePng}>
          Export PNG
        </button>
      </div>
      <p className="text-sm text-slate-500">
        For the closest match to the preview, use `Export Interactive HTML`. For PDF, the app opens a print-ready page and you choose `Save as PDF`.
      </p>
      {status ? <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">{status}</div> : null}
      {resume.templateId === "interactive" ? (
        <p className="text-sm text-slate-500">
          The Interactive template is preserved best as HTML. DOCX remains an editable Word document, and PDF remains a visual snapshot rather than a live interactive document.
        </p>
      ) : null}
    </section>
  );
}
