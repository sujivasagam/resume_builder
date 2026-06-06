import { ResumeDocument } from "../types";
import { exportResumeAsDoc, exportResumeAsDocx, exportResumeAsPdf, exportResumeAsPng } from "../services/export";

interface Props {
  resume: ResumeDocument;
}

export function ExportCenter({ resume }: Props) {
  const handlePdf = async () => {
    const element = document.getElementById("resume-preview-sheet");
    if (!element) return;
    await exportResumeAsPdf(element, `${resume.name}.pdf`);
  };

  const handlePng = async () => {
    const element = document.getElementById("resume-preview-sheet");
    if (!element) return;
    await exportResumeAsPng(element, `${resume.name}.png`);
  };

  return (
    <section className="studio-panel space-y-5">
      <div>
        <p className="eyebrow">Export Center</p>
        <h2 className="section-title">PDF, DOC, DOCX, PNG</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <button className="primary-button" onClick={handlePdf}>
          Export PDF
        </button>
        <button className="secondary-button" onClick={() => exportResumeAsDocx(resume)}>
          Export DOCX
        </button>
        <button className="secondary-button" onClick={() => exportResumeAsDoc(resume)}>
          Export DOC
        </button>
        <button className="secondary-button" onClick={handlePng}>
          Export PNG
        </button>
      </div>
      <p className="text-sm text-slate-500">
        PDF and PNG use canvas capture so the exported file tracks the live preview styling much more closely than browser print.
      </p>
    </section>
  );
}
