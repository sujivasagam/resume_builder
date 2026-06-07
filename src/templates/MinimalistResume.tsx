import { BaseResumeTemplate } from "./BaseResumeTemplate";
import { ResumeDocument } from "../types";

export function MinimalistResume({ resume }: { resume: ResumeDocument }) {
  return (
    <BaseResumeTemplate
      resume={resume}
      variant={{
        shell: "bg-white text-stone-900",
        header: "bg-white",
        heading: "text-stone-900",
        accent: "text-stone-900",
        body: "text-stone-500",
        section: "border-stone-200 bg-white",
        font: "font-sans",
        layout: "single",
      }}
    />
  );
}
