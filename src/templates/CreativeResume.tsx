import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function CreativeResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-[#fffdf7] text-[#172033]",
        header: "bg-[linear-gradient(135deg,#fde68a,#fca5a5_40%,#c4b5fd)]",
        heading: "text-[#172033]",
        accent: "text-[#7c3aed]",
        body: "text-[#364152]",
        section: "border-white/70 bg-white/70",
        font: "font-[Outfit]",
        layout: "hero",
      }}
    />
  );
}
