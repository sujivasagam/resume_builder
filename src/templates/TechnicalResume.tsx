import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function TechnicalResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-[#09111f] text-[#e2e8f0]",
        header: "bg-[linear-gradient(135deg,#0f172a,#111827)] text-white",
        heading: "text-slate-100",
        accent: "text-emerald-300",
        body: "text-slate-300",
        section: "border-emerald-400/15 bg-emerald-400/5",
        sidebar: "rounded-[1.5rem] bg-[#0f172a] p-6",
        font: "font-[JetBrains_Mono]",
        layout: "split",
      }}
    />
  );
}
