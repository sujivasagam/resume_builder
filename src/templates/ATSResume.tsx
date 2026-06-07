import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function ATSResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-white text-black shadow-none",
        header: "bg-white",
        heading: "text-black",
        accent: "text-black",
        body: "text-neutral-700",
        section: "border-neutral-300 bg-white",
        font: "font-sans",
        layout: "single",
      }}
    />
  );
}
