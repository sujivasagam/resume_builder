import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function ElegantResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-[#fffaf5] text-[#2f241c]",
        header: "bg-[linear-gradient(135deg,#fffaf5,#fdf2e9)]",
        heading: "text-[#2f241c]",
        accent: "text-[#c26d3a]",
        body: "text-[#5e4c40]",
        section: "border-[#ead8c8] bg-white/70",
        font: "font-serif",
        layout: "hero",
      }}
    />
  );
}
