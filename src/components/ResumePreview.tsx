import { ResumeDocument } from "../types";
import { renderTemplate } from "../templates/index";

interface Props {
  resume: ResumeDocument;
  compact: boolean;
}

export function ResumePreview({ resume, compact }: Props) {
  return (
    <section className="studio-panel h-full">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Live Preview</p>
          <h2 className="section-title">Exact canvas export target</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500">{resume.templateId}</span>
      </div>

      <div className={`preview-stage ${compact ? "preview-stage-compact" : ""}`}>
        <div id="resume-preview-sheet" className="mx-auto w-full max-w-[920px]">
          {renderTemplate(resume, resume.templateId)}
        </div>
      </div>
    </section>
  );
}
