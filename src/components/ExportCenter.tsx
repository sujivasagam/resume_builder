import { useState } from "react";
import { ResumeDocument } from "../types";
import { exportResumeAsDoc, exportResumeAsDocx, exportResumeAsInteractiveHtml, exportResumeAsPdf } from "../services/export";

interface Props {
  resume: ResumeDocument;
}

export function ExportCenter({ resume }: Props) {
  const [status, setStatus] = useState<string>("");

  const getPreviewElement = () => document.getElementById("resume-preview-sheet");
  const logExportError = (format: "PDF" | "DOC" | "DOCX", error: unknown) => {
    console.error(`[Resume Export] ${format} export failed`, error);
  };

  const handlePdf = async () => {
    const element = getPreviewElement();
    if (!element) {
      const error = new Error("Resume preview element #resume-preview-sheet was not found.");
      logExportError("PDF", error);
      setStatus(error.message);
      return;
    }
    try {
      setStatus("Generating visual PDF...");
      await exportResumeAsPdf(element, `${resume.name}.pdf`, resume);
      setStatus("PDF downloaded.");
    } catch (error) {
      logExportError("PDF", error);
      setStatus(error instanceof Error ? error.message : "PDF export failed.");
    }
  };

  const handleDocx = async () => {
    const element = getPreviewElement();
    if (!element) {
      const error = new Error("Resume preview element #resume-preview-sheet was not found.");
      logExportError("DOCX", error);
      setStatus(error.message);
      return;
    }
    try {
      setStatus("Generating visual DOCX...");
      await exportResumeAsDocx(element, resume);
      setStatus("DOCX downloaded.");
    } catch (error) {
      logExportError("DOCX", error);
      setStatus(error instanceof Error ? error.message : "DOCX export failed.");
    }
  };

  const handleDoc = async () => {
    const element = getPreviewElement();
    if (!element) {
      const error = new Error("Resume preview element #resume-preview-sheet was not found.");
      logExportError("DOC", error);
      setStatus(error.message);
      return;
    }
    try {
      setStatus("Generating visual DOC...");
      await exportResumeAsDoc(element, resume);
      setStatus("DOC downloaded.");
    } catch (error) {
      logExportError("DOC", error);
      setStatus(error instanceof Error ? error.message : "DOC export failed.");
    }
  };

  const handleInteractiveHtml = () => {
    const element = getPreviewElement();
    if (!element) return;
    exportResumeAsInteractiveHtml(element, `${resume.name}.html`);
    setStatus("Interactive HTML downloaded. Open it in a browser for the closest match to the preview.");
  };

  return (
    <section className="studio-panel export-panel space-y-5">
      <div>
        <p className="eyebrow">Export Center</p>
        <h2 className="section-title">PDF, DOC, DOCX, HTML</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <button className="primary-button export-button" onClick={handleInteractiveHtml}>
          Export Interactive HTML
        </button>
        <button className="primary-button export-button" onClick={handlePdf}>
          Export PDF
        </button>
        <button className="secondary-button export-button" onClick={handleDocx}>
          Export DOCX
        </button>
        <button className="secondary-button export-button" onClick={handleDoc}>
          Export DOC
        </button>
      </div>
      <p className="text-sm text-slate-500">
        PDF, DOC, and DOCX now use the live preview as the visual export source so the downloaded file matches what you see more closely. HTML still keeps the live browser interaction behavior.
      </p>
      {status ? <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">{status}</div> : null}
      {resume.templateId === "interactive" ? (
        <p className="text-sm text-slate-500">
          For the Interactive template, PDF, DOC, and DOCX export the same visual design without the browser-only navigation behavior. HTML still keeps the browser-style section navigation.
        </p>
      ) : null}
    </section>
  );
}
