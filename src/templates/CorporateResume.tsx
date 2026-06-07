import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function CorporateResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-white text-slate-900",
        header: "bg-[linear-gradient(135deg,#f8fafc,#eff6ff)]",
        heading: "text-slate-900",
        accent: "text-sky-700",
        body: "text-slate-600",
        section: "border-sky-100 bg-sky-50/50",
        font: "font-sans",
        layout: "split",
      }}
    />
  );
}
