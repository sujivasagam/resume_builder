import { useState } from "react";
import { ResumeDocument } from "../types";
import { exportResumeAsDoc, exportResumeAsDocx, exportResumeAsPdf, exportResumeAsPng } from "../services/export";

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

  return (
    <section className="studio-panel export-panel space-y-5">
      <div>
        <p className="eyebrow">Export Center</p>
        <h2 className="section-title">PDF, DOC, DOCX, PNG</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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
        PDF now opens a print-ready resume page. In the print dialog, choose `Save as PDF`.
      </p>
      {status ? <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">{status}</div> : null}
      {resume.templateId === "interactive" ? (
        <p className="text-sm text-slate-500">
          The Interactive template keeps clickable section navigation inside DOC-style exports and DOCX bookmarks. PDF preserves the visual menu, but standard PDF export behaves more like a designed snapshot than live tabs.
        </p>
      ) : null}
    </section>
  );
}
