import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function ExecutiveResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-white text-slate-950",
        header: "bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 text-white",
        heading: "text-slate-900",
        accent: "text-blue-400",
        body: "text-slate-200",
        section: "border-slate-200 bg-slate-50/70",
        font: "font-[Outfit]",
        layout: "split",
      }}
    />
  );
}
