import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function ModernResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-white text-zinc-950",
        header: "bg-[linear-gradient(135deg,#fff7ed,white_45%,#dbeafe)]",
        heading: "text-zinc-900",
        accent: "text-orange-500",
        body: "text-zinc-600",
        section: "border-orange-100 bg-orange-50/60",
        font: "font-sans",
        layout: "hero",
      }}
    />
  );
}
