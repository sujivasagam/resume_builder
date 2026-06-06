import { TemplateDefinition, TemplateId, ResumeDocument } from "../types";
import { ATSResume } from "./ATSResume";
import { CorporateResume } from "./CorporateResume";
import { CreativeResume } from "./CreativeResume";
import { ElegantResume } from "./ElegantResume";
import { ExecutiveResume } from "./ExecutiveResume";
import { MinimalistResume } from "./MinimalistResume";
import { ModernResume } from "./ModernResume";
import { PortfolioResume } from "./PortfolioResume";
import { SidebarResume } from "./SidebarResume";
import { TechnicalResume } from "./TechnicalResume";
import { InteractiveResume } from "./InteractiveResume";

export const templateCatalog: TemplateDefinition[] = [
  { id: "executive", name: "Executive", category: "Executive", description: "High-trust leadership layout with a formal split composition.", accent: "from-slate-900 to-blue-900", fontFamily: "Outfit" },
  { id: "modern", name: "Modern", category: "Professional", description: "Bright SaaS-style composition with a hero summary and warm accents.", accent: "from-orange-200 to-blue-200", fontFamily: "Inter" },
  { id: "minimalist", name: "Minimalist", category: "Professional", description: "Quiet, high-whitespace template for clean editorial resumes.", accent: "from-stone-100 to-white", fontFamily: "Inter" },
  { id: "sidebar", name: "Sidebar", category: "Professional", description: "Dark sidebar treatment with strong hierarchy for experienced candidates.", accent: "from-slate-900 to-cyan-900", fontFamily: "Inter" },
  { id: "corporate", name: "Corporate", category: "Project Management", description: "Structured business layout suited to operations and delivery roles.", accent: "from-sky-100 to-slate-100", fontFamily: "Inter" },
  { id: "elegant", name: "Elegant", category: "Executive", description: "Serif-forward layout with premium spacing and polished typography.", accent: "from-amber-100 to-orange-100", fontFamily: "Playfair Display" },
  { id: "portfolio", name: "Portfolio", category: "Creative", description: "Visually rich storytelling layout for product and hybrid technical roles.", accent: "from-blue-600 to-fuchsia-500", fontFamily: "Outfit" },
  { id: "ats", name: "ATS Optimized", category: "ATS", description: "Plain-language, low-noise format designed for ATS parsing clarity.", accent: "from-neutral-100 to-neutral-200", fontFamily: "Inter" },
  { id: "creative", name: "Creative", category: "Creative", description: "Bold color, expressive hierarchy, and gallery-ready presentation.", accent: "from-amber-200 via-rose-200 to-violet-200", fontFamily: "Outfit" },
  { id: "technical", name: "Technical Professional", category: "Technical", description: "Dense engineering-focused layout with strong stack visibility.", accent: "from-emerald-300 to-slate-800", fontFamily: "JetBrains Mono" },
  { id: "interactive", name: "Interactive", category: "Interactive", description: "Navigation-first layout with clickable section menus inside the live resume view.", accent: "from-slate-900 via-blue-700 to-cyan-400", fontFamily: "Inter" },
];

export function renderTemplate(resume: ResumeDocument, templateId: TemplateId) {
  switch (templateId) {
    case "executive":
      return <ExecutiveResume resume={resume} />;
    case "modern":
      return <ModernResume resume={resume} />;
    case "minimalist":
      return <MinimalistResume resume={resume} />;
    case "sidebar":
      return <SidebarResume resume={resume} />;
    case "corporate":
      return <CorporateResume resume={resume} />;
    case "elegant":
      return <ElegantResume resume={resume} />;
    case "portfolio":
      return <PortfolioResume resume={resume} />;
    case "ats":
      return <ATSResume resume={resume} />;
    case "creative":
      return <CreativeResume resume={resume} />;
    case "technical":
      return <TechnicalResume resume={resume} />;
    case "interactive":
      return <InteractiveResume resume={resume} />;
    default:
      return <ExecutiveResume resume={resume} />;
  }
}
