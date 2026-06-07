import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function SidebarResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-slate-950 text-white",
        header: "bg-slate-900 text-white",
        heading: "text-white",
        accent: "text-cyan-300",
        body: "text-slate-300",
        section: "border-white/10 bg-white/5",
        sidebar: "rounded-[1.5rem] bg-white/5 p-6",
        font: "font-sans",
        layout: "split",
      }}
    />
  );
}
