import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function PortfolioResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-[#0b1020] text-white",
        header: "bg-[radial-gradient(circle_at_top_left,#2563eb,#0f172a_65%)] text-white",
        heading: "text-white",
        accent: "text-fuchsia-300",
        body: "text-slate-200",
        section: "border-white/10 bg-white/5",
        sidebar: "rounded-[1.5rem] bg-white/5 p-6",
        font: "font-sans",
        layout: "hero",
      }}
    />
  );
}
