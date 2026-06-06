/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Printer,
  Search,
  Code2,
  Sliders,
  ChevronRight,
  CheckCircle2,
  Copy,
  FileText,
  AlertCircle,
  ThumbsUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  Layers,
  BookOpen,
  Calendar,
  Layers3,
  UserCheck
} from "lucide-react";
import { resumeData } from "./resumeData";
import { jobTemplates, JobTemplate } from "./templates";
import { ResumeData, ProjectItem, ExperienceItem } from "./types";

export default function App() {
  // App view tabs
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "projects" | "certs" | "ai">("profile");

  // Visual customizer states
  const [theme, setTheme] = useState<"slate" | "emerald" | "crimson">("slate");
  const [density, setDensity] = useState<"compact" | "normal" | "spacious">("normal");
  const [focusArea, setFocusArea] = useState<"all" | "pm" | "tech" | "ai">("all");

  // Interactive experience detail drawer state
  const [selectedExpId, setSelectedExpId] = useState<string | null>("exp-1");

  // Project filtering & search states
  const [projectSearch, setProjectSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<"all" | "saas" | "intranet" | "custom" | "db">("all");

  // Certification filtering & search states
  const [certSearch, setCertSearch] = useState("");
  const [certFilter, setCertFilter] = useState<"all" | "ai" | "pm">("all");

  // AI Copilot states
  const [customJobDesc, setCustomJobDesc] = useState("");
  const [currentSelectedTemplate, setCurrentSelectedTemplate] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    tailoredHeadline: string;
    tailoredSummary: string;
    highlightedProjects: Array<{ projectId: string; projectName: string; matchingAngle: string }>;
    coverLetter: string;
    interviewPrep: string[];
  } | null>(null);

  // Copy indicator helper
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  // Sandboxed download & print helpers
  const [isIframe, setIsIframe] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [printLayout, setPrintLayout] = useState<"interactive" | "classic-split" | "classic-minimal">("interactive");

  useEffect(() => {
    setIsIframe(window.self !== window.top);

    // Synchronize selected tab from URL parameters or hash on initial boot
    const handleUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get("tab");
      const hashTab = window.location.hash.replace("#", "");
      const targetTab = (queryTab || hashTab) as any;
      const validTabs = ["profile", "experience", "projects", "certs", "ai"];

      if (validTabs.includes(targetTab)) {
        setActiveTab(targetTab);
      }
    };

    handleUrlState();
    window.addEventListener("hashchange", handleUrlState);
    return () => window.removeEventListener("hashchange", handleUrlState);
  }, []);

  // Reflect tab clicks directly to raw URL Hash for instant deep-linking from PDF/DOCX copies
  useEffect(() => {
    const currentHash = window.location.hash.replace("#", "");
    if (activeTab && currentHash !== activeTab) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }
  }, [activeTab]);

  // Load a job vacancy template in one click
  const handleLoadTemplate = (index: number) => {
    setCurrentSelectedTemplate(index);
    const tmpl = jobTemplates[index];
    setCustomJobDesc(tmpl.description);
    setFocusArea(tmpl.focus as any);
  };

  // Run server-side Gemini customization
  const handleAnalyzeJobDescription = async () => {
    if (!customJobDesc.trim()) {
      setAiError("Please select a template above or paste a custom job description first.");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: customJobDesc,
          focus: focusArea,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with state ${response.status}`);
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to analyze resume. Please confirm the server is running correctly.");
    } finally {
      setAiLoading(false);
    }
  };

  // Theme styling definitions
  const themeClasses = {
    slate: {
      primary: "bg-slate-900 border-slate-800 text-slate-100 rounded-xl",
      accentText: "text-blue-600",
      accentBg: "bg-blue-600 hover:bg-blue-700 text-white",
      card: "bg-white border-slate-200 text-slate-800 shadow-sm rounded-xl",
      sidebarBg: "bg-slate-50 border-r border-slate-200",
      badge: "bg-blue-50 text-blue-700 border-blue-100 rounded-full font-sans font-bold text-xxs px-2.5 py-0.5",
      pills: "bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg",
      activePill: "bg-slate-900 text-white",
      bodyBg: "bg-slate-50 text-slate-950 font-sans",
      lightBorder: "border-slate-200",
      subAccent: "text-slate-500 font-sans",
      font: "font-sans",
      fontTitle: "font-display font-extrabold text-slate-900 tracking-tight",
      fontHeading: "font-sans font-bold text-slate-900 text-lg border-b border-slate-200 pb-2 mb-3",
      statCard: "p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-xs",
      tag: "bg-slate-100 border border-slate-200 text-slate-800 rounded px-2 py-0.5 text-xs font-semibold",
      cardOutline: "rounded-xl bg-white border border-slate-200 shadow-sm",
      timelineDot: "bg-blue-600 rounded-full w-2.5 h-2.5 border-2 border-white ring-4 ring-blue-50",
      badgeText: "text-slate-600",
    },
    emerald: {
      primary: "bg-emerald-950 border-emerald-900 text-emerald-50 rounded-lg border-dashed border-2 relative [background:repeating-linear-gradient(45deg,#042f2e,#042f2e_10px,#022c22_10px,#022c22_20px)]",
      accentText: "text-emerald-700 font-mono",
      accentBg: "bg-emerald-700 hover:bg-emerald-800 text-white font-mono",
      card: "bg-white border-emerald-300 border-dashed text-emerald-950 rounded-lg border",
      sidebarBg: "bg-emerald-50/50 border-r border-emerald-200 border-dashed",
      badge: "bg-emerald-50 text-emerald-800 border-[1.5px] border-emerald-300 rounded font-mono font-bold text-xxs uppercase tracking-wider px-2 py-0.5",
      pills: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-mono",
      activePill: "bg-emerald-850 text-white font-mono",
      bodyBg: "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:16px_16px] bg-slate-50 text-slate-950 font-sans",
      lightBorder: "border-emerald-250 border-dashed",
      subAccent: "text-emerald-700 font-mono text-xs",
      font: "font-sans font-medium",
      fontTitle: "font-mono font-bold text-emerald-950 tracking-wider uppercase",
      fontHeading: "font-mono font-bold text-emerald-900 text-base border-l-4 border-b border-emerald-400 bg-emerald-50/40 pl-3 py-1 mb-3 uppercase tracking-wide",
      statCard: "p-4 bg-emerald-50/40 border border-dashed border-emerald-300 rounded-md shadow-none font-mono text-xs",
      tag: "bg-emerald-50 border border-emerald-250 text-emerald-900 rounded font-mono px-2 py-0.5 text-xs font-bold uppercase",
      cardOutline: "rounded-lg bg-white border border-dashed border-emerald-300 shadow-none",
      timelineDot: "bg-emerald-700 rounded-none rotate-45 w-2.5 h-2.5 border border-emerald-900",
      badgeText: "text-emerald-850 font-mono font-bold text-xxs",
    },
    crimson: {
      primary: "bg-rose-950 border-rose-900 text-rose-50 rounded-none border-double border-4",
      accentText: "text-rose-800 font-serif",
      accentBg: "bg-rose-800 hover:bg-rose-900 text-white font-serif tracking-wide",
      card: "bg-stone-50 border-stone-350 border text-stone-900 shadow-none rounded-none p-6 md:p-8",
      sidebarBg: "bg-stone-100/70 border-r border-stone-300",
      badge: "bg-rose-50 text-rose-950 border-rose-220 font-serif italic rounded-none text-xxs px-2.5 py-0.5",
      pills: "bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-none font-serif italic",
      activePill: "bg-rose-900 text-white rounded-none font-serif italic",
      bodyBg: "bg-stone-100 text-stone-950 font-serif leading-relaxed",
      lightBorder: "border-stone-350",
      subAccent: "text-rose-800 font-serif italic",
      font: "font-serif",
      fontTitle: "font-serif font-bold text-rose-950 tracking-normal italic",
      fontHeading: "font-serif font-semibold text-rose-950 text-lg md:text-xl border-b-2 border-stone-400 pb-1 mb-4 italic uppercase tracking-wider",
      statCard: "p-4 bg-stone-100/40 border border-stone-350 rounded-none shadow-none font-serif h-full",
      tag: "bg-stone-100 border border-stone-300 text-stone-950 rounded-none font-serif italic px-2.5 py-1 text-xs",
      cardOutline: "rounded-none bg-stone-50 border border-stone-300 shadow-none",
      timelineDot: "bg-rose-900 rounded-none w-3.5 h-3.5 origin-center rotate-0 border border-stone-400",
      badgeText: "text-rose-900 font-serif italic text-xxs",
    },
  };

  const classicColors = {
    slate: {
      primaryText: "text-slate-900",
      accentText: "text-blue-600",
      accentBg: "bg-blue-600",
      border: "border-slate-800",
      subborder: "border-slate-200",
      secondaryText: "text-slate-600",
      paragraphText: "text-slate-700",
      accentLabel: "text-slate-900 bg-slate-50 border border-slate-200",
    },
    emerald: {
      primaryText: "text-emerald-950",
      accentText: "text-teal-600",
      accentBg: "bg-emerald-700",
      border: "border-emerald-800",
      subborder: "border-emerald-200",
      secondaryText: "text-emerald-800/80",
      paragraphText: "text-emerald-950/80",
      accentLabel: "text-emerald-950 bg-emerald-50 border border-emerald-150",
    },
    crimson: {
      primaryText: "text-rose-950",
      accentText: "text-rose-700",
      accentBg: "bg-rose-900",
      border: "border-rose-900",
      subborder: "border-stone-250",
      secondaryText: "text-rose-900/80",
      paragraphText: "text-stone-900/85",
      accentLabel: "text-rose-950 bg-rose-50 border border-rose-150",
    },
  };

  const curThemeStr = theme;
  const tc = themeClasses[curThemeStr];

  // Density padding classes
  const dentPaddings = {
    compact: {
      cardPad: "p-3",
      listSpace: "space-y-1.5",
      textSpacing: "space-y-1 my-1",
      sectionGap: "space-y-3",
      headingGap: "mb-1.5",
    },
    normal: {
      cardPad: "p-5",
      listSpace: "space-y-3",
      textSpacing: "space-y-2 my-2",
      sectionGap: "space-y-6",
      headingGap: "mb-3",
    },
    spacious: {
      cardPad: "p-7",
      listSpace: "space-y-4.5",
      textSpacing: "space-y-3 my-3",
      sectionGap: "space-y-8",
      headingGap: "mb-4",
    },
  }[density];

  // Trigger browser print
  const handleTriggerPrint = () => {
    if (window.self !== window.top) {
      setShowSandboxModal(true);
    }
    window.print();
  };

  // Robust programmatic DOCX download that is highly resilient in sandbox environments
  const handleDownloadDocx = async () => {
    if (window.self !== window.top) {
      setShowSandboxModal(true);
    }

    setDocxLoading(true);
    try {
      const url = getDocxDownloadUrl();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Local server download endpoint succeeded with error: " + response.status);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      tempLink.setAttribute("download", "Sujitha_Manivasagam_Resume.docx");
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Programmatic download failed, falling back to direct navigation: ", err);
      // Fallback
      window.open(getDocxDownloadUrl(), "_blank");
    } finally {
      setDocxLoading(false);
    }
  };

  // Projects filtering block
  const filteredProjects = resumeData.projects.filter((p) => {
    const sTerm = projectSearch.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(sTerm) ||
      p.description.toLowerCase().includes(sTerm) ||
      p.techStack.some((t) => t.toLowerCase().includes(sTerm));

    if (!matchesSearch) return false;

    if (projectFilter === "all") return true;
    if (projectFilter === "saas") {
      return p.id === "proj-1" || p.description.toLowerCase().includes("lms") || p.description.toLowerCase().includes("platform");
    }
    if (projectFilter === "intranet") {
      return p.id === "proj-6" || p.description.toLowerCase().includes("intranet") || p.id === "proj-9";
    }
    if (projectFilter === "custom") {
      return p.id === "proj-3" || p.id === "proj-4" || p.id === "proj-5";
    }
    if (projectFilter === "db") {
      return p.database === "MySQL" || p.database === "MYSQL" || p.description.toLowerCase().includes("query");
    }
    return true;
  });

  // Certifications filtering block
  const filteredCerts = resumeData.certifications.filter((c) => {
    const sTerm = certSearch.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(sTerm) ||
      c.issuer.toLowerCase().includes(sTerm) ||
      (c.credentialId && c.credentialId.toLowerCase().includes(sTerm));

    if (!matchesSearch) return false;

    if (certFilter === "all") return true;
    if (certFilter === "ai") {
      return c.name.toLowerCase().includes("ai") || c.name.toLowerCase().includes("generative") || c.name.toLowerCase().includes("prompt");
    }
    if (certFilter === "pm") {
      return c.name.toLowerCase().includes("project management") || c.name.toLowerCase().includes("agile") || c.name.toLowerCase().includes("plan") || c.name.toLowerCase().includes("initiation");
    }
    return true;
  });

  // Total AI Specialization vs PM Cert counters
  const aiCertCount = resumeData.certifications.filter(c => c.name.toLowerCase().includes("ai") || c.name.toLowerCase().includes("generative") || c.name.toLowerCase().includes("prompt")).length;
  const pmCertCount = resumeData.certifications.filter(c => c.name.toLowerCase().includes("project") || c.name.toLowerCase().includes("agile") || c.name.toLowerCase().includes("plan") || c.name.toLowerCase().includes("capstone")).length;

  // Custom text copier helper
  const copyTextToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === "cover") {
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    } else {
      setCopiedContact(type);
      setTimeout(() => setCopiedContact(null), 2000);
    }
  };

  // Dynamically resolve optimized DOCX download path
  const getDocxDownloadUrl = () => {
    let url = "/api/download/docx";
    const params: string[] = [];
    if (theme) {
      params.push(`theme=${theme}`);
    }
    if (printLayout) {
      params.push(`layout=${printLayout}`);
    }
    if (aiResult?.tailoredHeadline) {
      params.push(`headline=${encodeURIComponent(aiResult.tailoredHeadline)}`);
    }
    if (aiResult?.tailoredSummary) {
      params.push(`summary=${encodeURIComponent(aiResult.tailoredSummary)}`);
    }
    if (params.length > 0) {
      url += "?" + params.join("&");
    }
    return url;
  };

  // Dynamically resolve absolute URL for a specific tab (extremely valuable for PDF anchors)
  const getTabUrl = (tabStr: string) => {
    return `#${tabStr}`;
  };

  const renderClassicSheetsOnly = (
    activeTheme: "slate" | "emerald" | "crimson",
    activeLayout: "classic-split" | "classic-minimal",
    activeDensity: "compact" | "normal" | "spacious"
  ) => {
    const theme = activeTheme;
    const printLayout = activeLayout;
    const density = activeDensity;

    const classicDensity = {
      compact: {
        gap: "space-y-3",
        sectionGap: "mb-3.5",
        headerGap: "pb-2 mb-3",
        padding: "p-6 sm:p-8",
        itemGap: "space-y-2",
        listGap: "space-y-0.5",
        fontSize: "text-[10px]",
        titleSize: "text-[13px]",
        subTitleSize: "text-[10.5px]",
      },
      normal: {
        gap: "space-y-4.5",
        sectionGap: "mb-5",
        headerGap: "pb-3.5 mb-4.5",
        padding: "p-8 sm:p-12",
        itemGap: "space-y-3",
        listGap: "space-y-1",
        fontSize: "text-[10.5px] sm:text-[11px]",
        titleSize: "text-[15px] sm:text-[16px]",
        subTitleSize: "text-[11.5px] sm:text-[12px]",
      },
      spacious: {
        gap: "space-y-6",
        sectionGap: "mb-7 md:mb-8",
        headerGap: "pb-5 mb-6.5",
        padding: "p-10 sm:p-13 lg:p-15",
        itemGap: "space-y-4",
        listGap: "space-y-1.5",
        fontSize: "text-[11.5px] sm:text-[12.5px]",
        titleSize: "text-[16.5px] sm:text-[18px]",
        subTitleSize: "text-[12px] sm:text-[13px]",
      },
    }[density];

    const paperBg = {
      slate: "bg-white",
      emerald: "bg-[#fafcfa]",
      crimson: "bg-[#faf8f4]",
    }[theme];

    const sidebarBg = {
      slate: "bg-slate-50",
      emerald: "bg-[#edf5f2]",
      crimson: "bg-[#f5f1ea]",
    }[theme];

    const avatarBorder = {
      slate: "border-slate-800 bg-slate-900 text-white",
      emerald: "border-[#054035] bg-[#064e40] text-emerald-100",
      crimson: "border-[#37000d] bg-[#4c0519] text-[#fdd1d9]",
    }[theme];

    const textColors = classicColors[theme];

    // Spacing densities variables
    const paddingClass = classicDensity.padding;
    const itemGapClass = classicDensity.itemGap;
    const fontDesc = classicDensity.fontSize;
    const titleFont = classicDensity.titleSize;
    const subTitleFont = classicDensity.subTitleSize;

    return (
      <div className="flex-1 space-y-10 w-full animate-fadeIn select-all">
         
         {/* ======================================= */}
         {/* CLASSIC SPLIT SIDEBAR PREVIEW (Page 1) */}
         {/* ======================================= */}
         {printLayout === "classic-split" ? (
           <div className="space-y-10">
             {/* SHEET PAGE 1 */}
             <div className={`sheet-page relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} overflow-hidden rounded-md min-h-[1100px]`}>
               <div className="flex flex-col md:flex-row items-stretch min-h-[1100px]">
                 
                 {/* Left Sidebar block */}
                 <div className={`w-full md:w-64 shrink-0 ${sidebarBg} border-r border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between`}>
                   <div>
                     {/* Circular Monogram Initial frame */}
                     <div className="flex flex-col items-center text-center">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center border font-extrabold uppercase mb-3 shadow-md ${avatarBorder} text-xl tracking-wider`}>
                          SM
                       </div>
                       <h2 className="text-sm font-extrabold uppercase tracking-tight">{resumeData.name}</h2>
                       <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">PM & Architect</p>
                     </div>

                     {/* Contact block */}
                     <div className="mt-8 space-y-4 font-sans">
                       <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 font-bold">Contact Details</span>
                       <div className="space-y-4 text-[10px] text-slate-600 leading-normal font-sans">
                         <div className="flex items-center gap-2">
                           <Mail className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                           <span className="truncate">{resumeData.contact.email}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Phone className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                           <span>{resumeData.contact.phone}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <MapPin className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                           <span>Coimbatore, India</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Linkedin className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                           <span className="truncate text-blue-600 underline">linkedin.com/in/sm</span>
                         </div>
                       </div>
                     </div>

                     {/* Interactive Skills block */}
                     <div className="mt-8 space-y-4 font-sans">
                       <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 font-bold">PM Frameworks</span>
                       <div className="flex flex-wrap gap-1 mt-1">
                         {resumeData.topSkills.slice(0, 5).map((sk) => (
                           <span key={sk} className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${theme === 'crimson' ? 'bg-[#faf6f0] border-rose-105 text-[#4c0519]' : theme === 'emerald' ? 'bg-teal-50/40 border-teal-150 text-[#054035]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>{sk}</span>
                         ))}
                       </div>
                       
                       <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 mt-4 font-bold">Backend Stacks</span>
                       <div className="flex flex-wrap gap-1 mt-1">
                         {resumeData.backendSkills.slice(0, 6).map((sk) => (
                           <span key={sk} className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${theme === 'crimson' ? 'bg-[#faf6f0] border-rose-105 text-[#4c0519]' : theme === 'emerald' ? 'bg-teal-50/40 border-teal-150 text-[#054035]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>{sk}</span>
                         ))}
                       </div>
                     </div>
                   </div>

                   {/* Education block at the bottom */}
                   <div className="pt-6 border-t border-slate-200 mt-6 text-[10px] leading-relaxed font-sans">
                      <strong className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Academic Background</strong>
                      <p className="font-bold mt-1 text-slate-805">Anna University</p>
                      <p className="text-[9px] text-slate-500 font-medium">Master of Computer Applications</p>
                      <p className="text-[9px] text-slate-500 font-medium font-mono font-bold text-slate-705">GPA SCORE: 75% | Year 2009</p>
                   </div>
                 </div>

                 {/* Right Column details */}
                 <div className={`flex-1 ${paddingClass} flex flex-col gap-6`}>
                   {/* Dynamic tailored title and summaries */}
                   <div>
                     <h1 className={`text-xl sm:text-2xl font-extrabold uppercase tracking-tight`}>{resumeData.name}</h1>
                     <p className={`text-xs font-bold leading-relaxed mt-1 italic ${textColors.secondaryText}`}>
                       {aiResult?.tailoredHeadline || resumeData.headline}
                     </p>
                     <div className={`mt-3 text-[11px] leading-relaxed ${textColors.paragraphText}`}>
                       {aiResult?.tailoredSummary || resumeData.summary}
                     </div>
                   </div>

                   {/* Experience chronologies */}
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b-2 border-slate-805/10 pb-1 block mt-2 font-bold`}>
                     Chronological Work Experience
                   </span>

                   <div className="space-y-4">
                     {resumeData.experience.slice(0, 3).map((exp) => (
                       <div key={exp.id} className="relative pl-3 border-l border-slate-200">
                         <div className="flex items-start justify-between gap-2 flex-wrap">
                           <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                           <span className="text-[10px] font-mono leading-none bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0 font-semibold">{exp.period}</span>
                         </div>
                         <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">{exp.location} ({exp.duration})</p>
                         <ul className="list-disc pl-3 text-[10.5px] text-slate-600 mt-1.5 space-y-0.5">
                           {exp.highlights.slice(0, 3).map((hl, i) => (
                             <li key={i}>{hl}</li>
                           ))}
                         </ul>
                       </div>
                     ))}
                   </div>

                   {/* Page footnote indexer */}
                   <div className="mt-auto text-xxs font-sans text-stone-450 font-bold self-end text-right italic border-t border-slate-100 pt-2 w-full">
                       *Standard Page 1 of 2 layout
                   </div>
                 </div>

               </div>
             </div>

             {/* SHEET PAGE 2 */}
             <div className={`sheet-page relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} overflow-hidden rounded-md min-h-[1100px]`}>
               <div className="flex flex-col md:flex-row items-stretch min-h-[1100px]">
                 
                 {/* Left Sidebar continued */}
                 <div className={`w-full md:w-64 shrink-0 ${sidebarBg} border-r border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between`}>
                   <div>
                     <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 font-bold">Management Stack</span>
                     <div className="flex flex-wrap gap-1 mt-3">
                       {resumeData.managementSkills.slice(0, 6).map((sk) => (
                         <span key={sk} className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${theme === 'crimson' ? 'bg-[#faf6f0] border-rose-105 text-[#4c0519]' : theme === 'emerald' ? 'bg-teal-50/40 border-teal-150 text-[#054035]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>{sk}</span>
                       ))}
                     </div>

                     <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 mt-8 font-bold">LinkedIn Details</span>
                     <p className="text-[10px] text-slate-500 leading-normal mt-2">
                         View verified project backlogs, code boards, and milestones on linkedin: <br/>
                         <a href={`https://${resumeData.contact.linkedin}`} target="_blank" className="text-blue-650 font-bold underline font-mono break-all">{resumeData.contact.linkedin}</a>
                     </p>
                   </div>

                   <div className="pt-6 border-t border-slate-200 mt-6 text-[10px] leading-relaxed font-sans">
                      <strong className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Signature Mission</strong>
                      <p className="text-[9.5px] text-slate-505 italic mt-1 leading-normal font-medium">
                        "Fusing high scalability design with Agile governance to establish software deliverables that endure."
                      </p>
                   </div>
                 </div>

                 {/* Right Column Page 2 */}
                 <div className={`flex-1 ${paddingClass} flex flex-col justify-between`}>
                   <div className="space-y-6">
                     
                     {/* Remaining Experience */}
                     <div className="space-y-4">
                       <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1b365d] tracking-wide border-b border-slate-805/10 pb-1 block font-bold">
                         Chronological Experience (Continued)
                       </span>
                       <div className="space-y-4">
                         {resumeData.experience.slice(3).map((exp) => (
                           <div key={exp.id}>
                             <div className="flex items-start justify-between gap-1 flex-wrap">
                               <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                               <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-505 font-semibold">{exp.period}</span>
                             </div>
                             <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{exp.location}</p>
                             <ul className="list-disc pl-3 text-[10.5px] text-slate-600 mt-1">
                               {exp.highlights.slice(0, 2).map((hl, i) => (
                                 <li key={i}>{hl}</li>
                               ))}
                             </ul>
                           </div>
                         ))}
                       </div>
                     </div>

                     {/* Projects completed */}
                     <div className="space-y-3">
                       <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 tracking-wide border-b border-slate-805/10 pb-1 block font-bold">
                         Key Projects Completed
                       </span>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {resumeData.projects.map((p) => (
                           <div key={p.name} className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg space-y-1">
                             <div className="flex items-center justify-between gap-1">
                               <strong className="text-xs font-extrabold text-slate-900 block truncate">{p.name}</strong>
                               {p.url && <a href={p.url} target="_blank" className="text-blue-600 text-[10px] hover:underline font-bold shrink-0">View ↗</a>}
                             </div>
                             <p className="text-[10px] text-slate-600 leading-tight">{p.description}</p>
                             <span className="text-[8.5px] font-mono text-slate-400 block font-semibold">Tech Stack: {p.techStack.join(", ")}</span>
                           </div>
                         ))}
                       </div>
                     </div>

                     {/* Professional Credentials Verification section */}
                     <div className="p-3 bg-indigo-50/30 border border-indigo-150/40 rounded-xl space-y-2 font-sans">
                       <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block font-bold">Verified Credentials Audit</span>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-707 leading-normal font-medium">
                         <div className="flex gap-1">
                           <span className="text-emerald-600 font-bold">✔</span>
                           <span>Google PM (Verify ID: <a href="https://www.coursera.org/verify/QHEJG8WJLSZL" target="_blank" className="font-mono text-blue-650 underline">QHEJG8WJLSZL</a>)</span>
                         </div>
                         <div className="flex gap-1">
                           <span className="text-emerald-600 font-bold">✔</span>
                           <span>IBM GenAI (Verify Code: <span className="font-mono select-all font-semibold text-rose-700">IBMCC24</span>)</span>
                         </div>
                       </div>
                     </div>

                   </div>

                   <div className="mt-8 text-xxs font-sans text-stone-550 font-semibold flex items-center justify-between border-t border-slate-100 pt-2 w-full">
                       <span>M. Sujitha — Technical PM / Live Customizer</span>
                       <span className="italic">*Page 2 of 2</span>
                   </div>
                 </div>

               </div>
             </div>

           </div>
         ) : (
           /* ======================================= */
           /* CLASSIC MINIMALIST PREVIEW (Page 1 & 2) */
           /* ======================================= */
           <div className="space-y-10 animate-fadeIn">
             {/* SHEET PAGE 1 */}
             <div className={`sheet-page relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} ${paddingClass} overflow-hidden rounded-md min-h-[1100px] flex flex-col justify-between`}>
               <div className="space-y-5">
                 
                 {/* Minimal Header */}
                 <div className="border-b-2 border-slate-800/10 pb-4 mb-4 text-center">
                   <h2 className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase">{resumeData.name}</h2>
                   <p className={`text-xs font-bold font-sans tracking-wide leading-relaxed mt-1 italic ${textColors.secondaryText}`}>
                     Technical Project Manager & Agile Delivery Leader
                   </p>
                   <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-semibold font-mono mt-2 pt-1">
                     <span>{resumeData.contact.email}</span>
                     <span>|</span>
                     <span>{resumeData.contact.phone}</span>
                     <span>|</span>
                     <span className="underline break-all text-blue-660">linkedin.com/in/sm</span>
                     <span>|</span>
                     <span>Coimbatore, India</span>
                   </div>
                 </div>

                 {/* Summary section */}
                 <div className="space-y-1.5">
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block font-bold`}>
                     Executive Core Summary
                   </span>
                   <p className={`text-[10.5px] leading-relaxed ${textColors.paragraphText}`}>
                     {aiResult?.tailoredSummary || resumeData.summary}
                   </p>
                 </div>

                 {/* Skills Grid Horizontal layout */}
                 <div className="space-y-1.5 pt-1 font-sans">
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block font-bold`}>
                     Expertise & Technical Frameworks
                   </span>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[10px]">
                     <div className="p-2.5 rounded-lg border border-slate-200/50 bg-slate-50/40">
                       <strong className="block text-[8.5px] text-indigo-700 uppercase tracking-widest mb-1 font-bold">PM Paradigms</strong>
                       <p className="text-slate-600 leading-normal font-semibold">Agile, Scrum governance, Sprints, Backlogs, Risk reduction</p>
                     </div>
                     <div className="p-2.5 rounded-lg border border-slate-200/50 bg-slate-50/40">
                       <strong className="block text-[8.5px] text-indigo-700 uppercase tracking-widest mb-1 font-bold">Coding Stacks</strong>
                       <p className="text-slate-600 leading-normal font-semibold">PHP, Laravel, CodeIgniter, Slim, MySQL, APIs, Joomla</p>
                     </div>
                     <div className="p-2.5 rounded-lg border border-slate-200/50 bg-slate-50/40">
                       <strong className="block text-[8.5px] text-indigo-700 uppercase tracking-widest mb-1 font-bold">AI Integration</strong>
                       <p className="text-slate-600 leading-normal font-semibold">Generative AI lifecycles, Agile prompting, DevOps tools</p>
                     </div>
                   </div>
                 </div>

                 {/* Experience blocks */}
                 <div className="space-y-3 pt-2">
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block font-bold`}>
                     Chronological Work Experience
                   </span>
                   <div className="space-y-3.5">
                     {resumeData.experience.slice(0, 3).map((exp) => (
                       <div key={exp.id} className="space-y-1">
                         <div className="flex items-start justify-between">
                           <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                           <span className="text-[10px] font-semibold text-slate-550 font-mono italic">{exp.period}</span>
                         </div>
                         <p className="text-[9.5px] font-semibold text-slate-450">{exp.location} ∙ {exp.duration}</p>
                         <ul className="list-disc pl-3 text-[10.5px] text-slate-600 space-y-0.5">
                           {exp.highlights.slice(0, 3).map((hl, i) => (
                             <li key={i}>{hl}</li>
                           ))}
                         </ul>
                       </div>
                     ))}
                   </div>
                 </div>

               </div>

               <div className="mt-8 text-xxs font-sans text-stone-550 font-semibold flex items-center justify-between border-t border-slate-100 pt-2 w-full">
                   <span>M. Sujitha — Minimalist Theme Layout</span>
                   <span>Page 1 of 2</span>
               </div>
             </div>

             {/* SHEET PAGE 2 */}
             <div className={`sheet-page relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} ${paddingClass} overflow-hidden rounded-md min-h-[1100px] flex flex-col justify-between`}>
               <div className="space-y-5">
                 
                 {/* Centered Page header block */}
                 <div className="border-b border-slate-200 pb-1.5 mb-4 text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">M. Sujitha — PM & Architect Page 2</span>
                 </div>

                 {/* Remaining Experience */}
                 <div className="space-y-3">
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block font-bold`}>
                     Professional Experience Chronology (Continued)
                   </span>
                   <div className="space-y-3.5">
                     {resumeData.experience.slice(3).map((exp) => (
                       <div key={exp.id} className="space-y-1">
                         <div className="flex items-start justify-between">
                           <h4 className="text-xs font-extrabold text-slate-905 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                           <span className="text-[10px] font-semibold text-slate-550 font-mono italic">{exp.period}</span>
                         </div>
                         <p className="text-[9.5px] text-slate-400 font-semibold">{exp.location}</p>
                         <ul className="list-disc pl-3 text-[10.5px] text-slate-605 mt-1">
                           {exp.highlights.slice(0, 2).map((hl, i) => (
                             <li key={i}>{hl}</li>
                           ))}
                         </ul>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Enterprise projects */}
                 <div className="space-y-3 pt-2">
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block font-bold`}>
                     Key Projects Spotlights
                   </span>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {resumeData.projects.map((p) => (
                       <div key={p.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-[10px] space-y-1">
                         <div className="flex items-center justify-between gap-1">
                           <strong className="font-extrabold text-slate-900 block truncate">{p.name}</strong>
                           {p.url && <a href={p.url} target="_blank" className="text-blue-600 font-bold hover:underline shrink-0 text-[10px]">Verify Link ↗</a>}
                         </div>
                         <p className="text-slate-655 leading-tight mt-1">{p.description}</p>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Credentials highlights */}
                 <div className="space-y-3 pt-2 font-sans">
                   <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block font-bold`}>
                     Acquired Certifications
                   </span>
                   <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] text-slate-600 leading-normal font-medium">
                     <div className="flex items-start gap-1">
                       <span className="text-emerald-500 font-bold">✔</span>
                       <span><strong>Google PM Specialization</strong> (Jan 2024 · coursera.org/verify/QHEJG8WJLSZL)</span>
                     </div>
                     <div className="flex items-start gap-1">
                       <span className="text-emerald-505 font-bold">✔</span>
                       <span><strong>Generative AI for PMs</strong> (May 2026 · IBM/SkillUp)</span>
                     </div>
                     <div className="flex items-start gap-1">
                       <span className="text-emerald-505 font-bold">✔</span>
                       <span><strong>IBM Prompt Engineering Basics</strong> (May 2026 · IBMCC24)</span>
                     </div>
                     <div className="flex items-start gap-1">
                       <span className="text-emerald-505 font-bold">✔</span>
                       <span><strong>Google AI for App Building</strong> (May 2026 · GooglePM9)</span>
                     </div>
                   </div>
                 </div>

               </div>

               <div className="mt-8 text-xxs font-sans text-stone-550 font-semibold flex items-center justify-between border-t border-slate-100 pt-2 w-full">
                   <span>M. Sujitha — Technical PM / Resume Page 2</span>
                   <span>Page 2 of 2</span>
               </div>
             </div>

           </div>
         )}

      </div>
    );
  };

  const renderClassicDeskView = () => {
    const classicDensity = {
      compact: {
        gap: "space-y-3",
        sectionGap: "mb-3.5",
        headerGap: "pb-2 mb-3",
        padding: "p-6 sm:p-8",
        itemGap: "space-y-2",
        listGap: "space-y-0.5",
        fontSize: "text-[10px]",
        titleSize: "text-[13px]",
        subTitleSize: "text-[10.5px]",
      },
      normal: {
        gap: "space-y-4.5",
        sectionGap: "mb-5",
        headerGap: "pb-3.5 mb-4.5",
        padding: "p-8 sm:p-12",
        itemGap: "space-y-3",
        listGap: "space-y-1",
        fontSize: "text-[10.5px] sm:text-[11px]",
        titleSize: "text-[15px] sm:text-[16px]",
        subTitleSize: "text-[11.5px] sm:text-[12px]",
      },
      spacious: {
        gap: "space-y-6",
        sectionGap: "mb-7 md:mb-8",
        headerGap: "pb-5 mb-6.5",
        padding: "p-10 sm:p-13 lg:p-15",
        itemGap: "space-y-4",
        listGap: "space-y-1.5",
        fontSize: "text-[11.5px] sm:text-[12.5px]",
        titleSize: "text-[16.5px] sm:text-[18px]",
        subTitleSize: "text-[12px] sm:text-[13px]",
      },
    }[density];

    const paperBg = {
      slate: "bg-white",
      emerald: "bg-[#fafcfa]",
      crimson: "bg-[#faf8f4]",
    }[theme];

    const sidebarBg = {
      slate: "bg-slate-50",
      emerald: "bg-[#edf5f2]",
      crimson: "bg-[#f5f1ea]",
    }[theme];

    const avatarBorder = {
      slate: "border-slate-800 bg-slate-900 text-white",
      emerald: "border-[#054035] bg-[#064e40] text-emerald-100",
      crimson: "border-[#37000d] bg-[#4c0519] text-[#fdd1d9]",
    }[theme];

    const textColors = classicColors[theme];

    // Spacing densities variables
    const paddingClass = classicDensity.padding;
    const itemGapClass = classicDensity.itemGap;
    const fontDesc = classicDensity.fontSize;
    const titleFont = classicDensity.titleSize;
    const subTitleFont = classicDensity.subTitleSize;

    return (
      <div className="flex flex-col xl:flex-row gap-8 items-start mb-16">
        
        {/* Interactive layout customization settings widget */}
        <div className="xl:sticky xl:top-24 w-full xl:w-80 shrink-0 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Theme Customizer</span>
          </div>
          <h3 className="text-base font-bold text-slate-905 leading-tight font-display">
            Realistic CV Preview
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            This workspace simulates the high-fidelity printable page with your active theme (<strong className="capitalize">{theme}</strong>) and density (<strong className="capitalize">{density}</strong>) in real-time.
          </p>

          <div className="border-t border-slate-100 pt-3.5 space-y-3">
             <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Layout Preset:</span>
               <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-150 text-xs">
                  <button
                    onClick={() => setPrintLayout("classic-split")}
                    className={`py-1.5 px-2 rounded font-bold text-center transition-all ${printLayout === "classic-split" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-950"}`}
                  >
                    Split Sidebar
                  </button>
                  <button
                    onClick={() => setPrintLayout("classic-minimal")}
                    className={`py-1.5 px-2 rounded font-bold text-center transition-all ${printLayout === "classic-minimal" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-950"}`}
                  >
                    Minimalist
                  </button>
               </div>
             </div>

             <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Theme Details:</span>
               <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-150 text-[10px] font-bold">
                  <button
                    onClick={() => setTheme("slate")}
                    className={`py-1 px-1 rounded transition-all ${theme === "slate" ? "bg-white text-slate-900 shadow-2xs border border-slate-200" : "text-slate-500 hover:text-slate-950"}`}
                  >
                    Slate
                  </button>
                  <button
                    onClick={() => setTheme("emerald")}
                    className={`py-1 px-1 rounded transition-all ${theme === "emerald" ? "bg-white text-teal-950 shadow-2xs border border-slate-200" : "text-slate-500 hover:text-teal-950"}`}
                  >
                    Teal Tech
                  </button>
                  <button
                    onClick={() => setTheme("crimson")}
                    className={`py-1 px-1 rounded transition-all ${theme === "crimson" ? "bg-white text-rose-950 shadow-2xs border border-slate-200" : "text-slate-500 hover:text-rose-900"}`}
                  >
                    Crimson
                  </button>
               </div>
             </div>

             <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Spacing Density:</span>
               <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-150 text-[10px] font-bold">
                  <button
                    onClick={() => setDensity("compact")}
                    className={`py-1 px-1 rounded transition-all ${density === "compact" ? "bg-white text-slate-900 shadow-2xs border border-slate-200" : "text-slate-500"}`}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => setDensity("normal")}
                    className={`py-1 px-1 rounded transition-all ${density === "normal" ? "bg-white text-slate-900 shadow-2xs border border-slate-200" : "text-slate-500"}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setDensity("spacious")}
                    className={`py-1 px-1 rounded transition-all ${density === "spacious" ? "bg-white text-slate-900 shadow-2xs border border-slate-200" : "text-slate-500"}`}
                  >
                    Spacious
                  </button>
               </div>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-3.5 space-y-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-xs w-full cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
            <button
               onClick={handleDownloadDocx}
               disabled={docxLoading}
               className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-xs w-full cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{docxLoading ? "Generating Word..." : "Download Word (DOCX)"}</span>
            </button>
          </div>
        </div>

        {/* Realistic Page sheets rendering desktop */}
        <div className="flex-1 space-y-10 w-full animate-fadeIn">
          {renderClassicSheetsOnly(theme, printLayout, density)}
          <div className="hidden">
           
           {/* ======================================= */}
           {/* CLASSIC SPLIT SIDEBAR PREVIEW (Page 1) */}
           {/* ======================================= */}
           {printLayout === "classic-split" ? (
             <div className="space-y-10">
               {/* SHEET PAGE 1 */}
               <div className={`relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} overflow-hidden rounded-md min-h-[1100px]`}>
                 <div className="flex flex-col md:flex-row items-stretch min-h-[1100px]">
                   
                   {/* Left Sidebar block */}
                   <div className={`w-full md:w-64 shrink-0 ${sidebarBg} border-r border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between`}>
                     <div>
                       {/* Circular Monogram Initial frame */}
                       <div className="flex flex-col items-center text-center">
                         <div className={`w-16 h-16 rounded-full flex items-center justify-center border font-extrabold uppercase mb-3 shadow-md ${avatarBorder} text-xl tracking-wider`}>
                            SM
                         </div>
                         <h2 className="text-sm font-extrabold uppercase tracking-tight">{resumeData.name}</h2>
                         <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">PM & Architect</p>
                       </div>

                       {/* Contact block */}
                       <div className="mt-8 space-y-4">
                         <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5">Contact Details</span>
                         <div className="space-y-4 text-[10px] text-slate-600 leading-normal">
                           <div className="flex items-center gap-2">
                             <Mail className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                             <span className="truncate">{resumeData.contact.email}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <Phone className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                             <span>{resumeData.contact.phone}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <MapPin className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                             <span>Coimbatore, India</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <Linkedin className="w-3.5 h-3.5 opacity-60 text-slate-500 shrink-0" />
                             <span className="truncate text-blue-600 underline">linkedin.com/in/sm</span>
                           </div>
                         </div>
                       </div>

                       {/* Interactive Skills block */}
                       <div className="mt-8 space-y-4">
                         <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5">PM Frameworks</span>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {resumeData.topSkills.slice(0, 5).map((sk) => (
                             <span key={sk} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${theme === 'crimson' ? 'bg-[#faf6f0] border-rose-100 text-[#4c0519]' : theme === 'emerald' ? 'bg-teal-50/40 border-teal-150 text-[#054035]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>{sk}</span>
                           ))}
                         </div>
                         
                         <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 mt-4">Backend Stacks</span>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {resumeData.backendSkills.slice(0, 6).map((sk) => (
                             <span key={sk} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${theme === 'crimson' ? 'bg-[#faf6f0] border-rose-100 text-[#4c0519]' : theme === 'emerald' ? 'bg-teal-50/40 border-teal-150 text-[#054035]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>{sk}</span>
                           ))}
                         </div>
                       </div>
                     </div>

                     {/* Education block at the bottom */}
                     <div className="pt-6 border-t border-slate-200 mt-6 text-[10px] leading-relaxed">
                        <strong className="block text-[9px] uppercase tracking-wider text-slate-400">Academic Background</strong>
                        <p className="font-bold mt-1 text-slate-805">Anna University</p>
                        <p className="text-[9px] text-slate-500">Master of Computer Applications</p>
                        <p className="text-[9px] text-slate-500">Graduated 2009 (Coimbatore)</p>
                     </div>
                   </div>

                   {/* Right Column details */}
                   <div className={`flex-1 ${paddingClass} flex flex-col gap-6`}>
                     {/* Dynamic tailored title and summaries */}
                     <div>
                       <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight">{resumeData.name}</h1>
                       <p className={`text-xs font-bold leading-relaxed mt-1 italic ${textColors.secondaryText}`}>
                         {aiResult?.tailoredHeadline || resumeData.headline}
                       </p>
                       <div className={`mt-3 text-[11px] leading-relaxed ${textColors.paragraphText}`}>
                         {aiResult?.tailoredSummary || resumeData.summary}
                       </div>
                     </div>

                     {/* Experience chronologies */}
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b-2 border-slate-805/10 pb-1 block mt-2`}>
                       Chronological Work Experience
                     </span>

                     <div className="space-y-4">
                       {resumeData.experience.slice(0, 3).map((exp) => (
                         <div key={exp.id} className="relative pl-3 border-l border-slate-200">
                           <div className="flex items-start justify-between gap-2 flex-wrap">
                             <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                             <span className="text-[10px] font-mono leading-none bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0 font-semibold">{exp.period}</span>
                           </div>
                           <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">{exp.location} ({exp.duration})</p>
                           <ul className="list-disc pl-3 text-[10.5px] text-slate-600 mt-1.5 space-y-0.5">
                             {exp.highlights.slice(0, 3).map((hl, i) => (
                               <li key={i}>{hl}</li>
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>

                     {/* Page footnote indexer */}
                     <div className="mt-auto text-xxs font-sans text-stone-450 font-bold self-end text-right italic border-t border-slate-100 pt-2 w-full">
                         *Standard Page 1 of 2 layout
                     </div>
                   </div>

                 </div>
               </div>

               {/* SHEET PAGE 2 */}
               <div className={`relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} overflow-hidden rounded-md min-h-[1100px]`}>
                 <div className="flex flex-col md:flex-row items-stretch min-h-[1100px]">
                   
                   {/* Left Sidebar continued */}
                   <div className={`w-full md:w-64 shrink-0 ${sidebarBg} border-r border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between`}>
                     <div>
                       <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5">Management Stack</span>
                       <div className="flex flex-wrap gap-1 mt-3">
                         {resumeData.managementSkills.slice(0, 6).map((sk) => (
                           <span key={sk} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${theme === 'crimson' ? 'bg-[#faf6f0] border-rose-100 text-[#4c0519]' : theme === 'emerald' ? 'bg-teal-50/40 border-teal-150 text-[#054035]' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>{sk}</span>
                         ))}
                       </div>

                       <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 mt-8">LinkedIn Details</span>
                       <p className="text-[10px] text-slate-500 leading-normal mt-2">
                           View verified project backlogs, code boards, and milestones on linkedin: <br/>
                           <a href={`https://${resumeData.contact.linkedin}`} target="_blank" className="text-blue-650 font-bold underline font-mono break-all">{resumeData.contact.linkedin}</a>
                       </p>
                     </div>

                     <div className="pt-6 border-t border-slate-200 mt-6 text-[10px] leading-relaxed">
                        <strong className="block text-[9px] uppercase tracking-wider text-slate-400">Signature Mission</strong>
                        <p className="text-[9.5px] text-slate-500 italic mt-1 leading-normal">
                          "Fusing high scalability design with Agile governance to establish software deliverables that endure."
                        </p>
                     </div>
                   </div>

                   {/* Right Column Page 2 */}
                   <div className={`flex-1 ${paddingClass} flex flex-col justify-between`}>
                     <div className="space-y-6">
                       
                       {/* Remaining Experience */}
                       <div className="space-y-4">
                         <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1b365d] tracking-wide border-b border-slate-805/10 pb-1 block">
                           Chronological Experience (Continued)
                         </span>
                         <div className="space-y-4">
                           {resumeData.experience.slice(3).map((exp) => (
                             <div key={exp.id}>
                               <div className="flex items-start justify-between gap-1 flex-wrap">
                                 <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                                 <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">{exp.period}</span>
                               </div>
                               <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{exp.location}</p>
                               <ul className="list-disc pl-3 text-[10.5px] text-slate-600 mt-1">
                                 {exp.highlights.slice(0, 2).map((hl, i) => (
                                   <li key={i}>{hl}</li>
                                 ))}
                               </ul>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Projects completed */}
                       <div className="space-y-3">
                         <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 tracking-wide border-b border-slate-805/10 pb-1 block">
                           Key Projects Completed
                         </span>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {resumeData.projects.map((p) => (
                             <div key={p.name} className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg space-y-1">
                               <div className="flex items-center justify-between gap-1">
                                 <strong className="text-xs font-extrabold text-slate-900 block truncate">{p.name}</strong>
                                 {p.url && <a href={p.url} target="_blank" className="text-blue-600 text-[10px] hover:underline font-bold shrink-0">View ↗</a>}
                               </div>
                               <p className="text-[10px] text-slate-600 leading-tight">{p.description}</p>
                               <span className="text-[8.5px] font-mono text-slate-400 block font-semibold">Tech Stack: {p.techStack.join(", ")}</span>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Professional Credentials Verification section */}
                       <div className="p-3 bg-indigo-50/30 border border-indigo-150/40 rounded-xl space-y-2">
                         <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">Verified Credentials Audit</span>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-700 leading-normal font-medium">
                           <div className="flex gap-1">
                             <span className="text-emerald-600">✔</span>
                             <span>Google PM (Verify ID: <a href="https://www.coursera.org/verify/QHEJG8WJLSZL" target="_blank" className="font-mono text-blue-650 underline">QHEJG8WJLSZL</a>)</span>
                           </div>
                           <div className="flex gap-1">
                             <span className="text-emerald-600">✔</span>
                             <span>IBM GenAI (Verify Code: <span className="font-mono select-all font-semibold text-rose-700">IBMCC24</span>)</span>
                           </div>
                         </div>
                       </div>

                     </div>

                     <div className="mt-8 text-xxs font-sans text-stone-550 font-semibold flex items-center justify-between border-t border-slate-100 pt-2 w-full">
                         <span>M. Sujitha — Technical PM / Live Customizer</span>
                         <span className="italic">*Page 2 of 2</span>
                     </div>
                   </div>

                 </div>
               </div>

             </div>
           ) : (
             /* ======================================= */
             /* CLASSIC MINIMALIST PREVIEW (Page 1 & 2) */
             /* ======================================= */
             <div className="space-y-10 animate-fadeIn">
               {/* SHEET PAGE 1 */}
               <div className={`relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} ${paddingClass} overflow-hidden rounded-md min-h-[1100px] flex flex-col justify-between`}>
                 <div className="space-y-5">
                   
                   {/* Minimal Header */}
                   <div className="border-b-2 border-slate-800/10 pb-4 mb-4 text-center">
                     <h2 className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase">{resumeData.name}</h2>
                     <p className={`text-xs font-bold font-sans tracking-wide leading-relaxed mt-1 italic ${textColors.secondaryText}`}>
                       Technical Project Manager & Agile Delivery Leader
                     </p>
                     <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-semibold font-mono mt-2 pt-1">
                       <span>{resumeData.contact.email}</span>
                       <span>|</span>
                       <span>{resumeData.contact.phone}</span>
                       <span>|</span>
                       <a href={`https://${resumeData.contact.linkedin}`} target="_blank" className="underline break-all text-blue-660">{resumeData.contact.linkedin}</a>
                       <span>|</span>
                       <span>Coimbatore, India</span>
                     </div>
                   </div>

                   {/* Summary section */}
                   <div className="space-y-1.5">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block`}>
                       Executive Core Summary
                     </span>
                     <p className={`text-[10.5px] leading-relaxed ${textColors.paragraphText}`}>
                       {aiResult?.tailoredSummary || resumeData.summary}
                     </p>
                   </div>

                   {/* Skills Grid Horizontal layout */}
                   <div className="space-y-1.5 pt-1">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block`}>
                       Expertise & Technical Frameworks
                     </span>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[10px]">
                       <div className="p-2.5 rounded-lg border border-slate-200/50 bg-slate-50/40">
                         <strong className="block text-[8.5px] text-indigo-700 uppercase tracking-widest mb-1">PM Paradigms</strong>
                         <p className="text-slate-600 leading-normal font-semibold">Agile, Scrum governance, Sprints, Backlogs, Risk reduction</p>
                       </div>
                       <div className="p-2.5 rounded-lg border border-slate-200/50 bg-slate-50/40">
                         <strong className="block text-[8.5px] text-indigo-700 uppercase tracking-widest mb-1">Coding Stacks</strong>
                         <p className="text-slate-600 leading-normal font-semibold">PHP, Laravel, CodeIgniter, Slim, MySQL, APIs, Joomla</p>
                       </div>
                       <div className="p-2.5 rounded-lg border border-slate-200/50 bg-slate-50/40">
                         <strong className="block text-[8.5px] text-indigo-700 uppercase tracking-widest mb-1">AI Integration</strong>
                         <p className="text-slate-600 leading-normal font-semibold">Generative AI lifecycles, Agile prompting, DevOps tools</p>
                       </div>
                     </div>
                   </div>

                   {/* Experience blocks */}
                   <div className="space-y-3 pt-2">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block`}>
                       Chronological Work Experience
                     </span>
                     <div className="space-y-3.5">
                       {resumeData.experience.slice(0, 3).map((exp) => (
                         <div key={exp.id} className="space-y-1">
                           <div className="flex items-start justify-between">
                             <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                             <span className="text-[10px] font-semibold text-slate-550 font-mono italic">{exp.period}</span>
                           </div>
                           <p className="text-[9.5px] font-semibold text-slate-450">{exp.location} ∙ {exp.duration}</p>
                           <ul className="list-disc pl-3 text-[10.5px] text-slate-600 space-y-0.5">
                             {exp.highlights.slice(0, 3).map((hl, i) => (
                               <li key={i}>{hl}</li>
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>
                   </div>

                 </div>

                 <div className="mt-8 text-xxs font-sans text-stone-500 font-semibold flex items-center justify-between border-t border-slate-100 pt-2 w-full">
                     <span>M. Sujitha — Minimalist Theme Layout</span>
                     <span>Page 1 of 2</span>
                 </div>
               </div>

               {/* SHEET PAGE 2 */}
               <div className={`relative ${paperBg} border border-slate-250 shadow-xl ${theme === "crimson" ? "font-serif" : "font-sans"} ${textColors.primaryText} ${paddingClass} overflow-hidden rounded-md min-h-[1100px] flex flex-col justify-between`}>
                 <div className="space-y-5">
                   
                   {/* Centered Page header block */}
                   <div className="border-b border-slate-200 pb-1.5 mb-4 text-right">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">M. Sujitha — PM & Architect Page 2</span>
                   </div>

                   {/* Remaining Experience */}
                   <div className="space-y-3">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block`}>
                       Professional Experience Chronology (Continued)
                     </span>
                     <div className="space-y-3.5">
                       {resumeData.experience.slice(3).map((exp) => (
                         <div key={exp.id} className="space-y-1">
                           <div className="flex items-start justify-between">
                             <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{exp.role} ∙ {exp.company}</h4>
                             <span className="text-[10px] font-semibold text-slate-500 font-mono italic">{exp.period}</span>
                           </div>
                           <p className="text-[9.5px] text-slate-400 font-semibold">{exp.location}</p>
                           <ul className="list-disc pl-3 text-[10.5px] text-slate-600 mt-1">
                             {exp.highlights.slice(0, 2).map((hl, i) => (
                               <li key={i}>{hl}</li>
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Enterprise projects */}
                   <div className="space-y-3 pt-2">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block`}>
                       Key Projects Spotlights
                     </span>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {resumeData.projects.map((p) => (
                         <div key={p.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-[10px] space-y-1">
                           <div className="flex items-center justify-between gap-1">
                             <strong className="font-extrabold text-slate-900 block truncate">{p.name}</strong>
                             {p.url && <a href={p.url} target="_blank" className="text-blue-600 font-bold hover:underline shrink-0 text-[10px]">Verify Link ↗</a>}
                           </div>
                           <p className="text-slate-600 leading-tight mt-1">{p.description}</p>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Credentials highlights */}
                   <div className="space-y-3 pt-2">
                     <span className={`text-[10px] font-extrabold uppercase tracking-widest ${textColors.accentText} border-b border-slate-805/10 pb-0.5 block`}>
                       Acquired Certifications
                     </span>
                     <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] text-slate-600 leading-normal">
                       <div className="flex items-start gap-1">
                         <span className="text-emerald-500 font-bold">✔</span>
                         <span><strong>Google Project Management Specialization</strong> (Jan 2024 · ID: <a href="https://www.coursera.org/verify/QHEJG8WJLSZL" target="_blank" className="font-mono text-blue-650 underline">QHEJG8WJLSZL</a>)</span>
                       </div>
                       <div className="flex items-start gap-1">
                         <span className="text-emerald-500 font-bold">✔</span>
                         <span><strong>Generative AI for PMs Specialization</strong> (May 2026 · IBM/SkillUp)</span>
                       </div>
                       <div className="flex items-start gap-1">
                         <span className="text-emerald-500 font-bold">✔</span>
                         <span><strong>IBM Generative AI: Prompt Engineering Basics</strong> (May 2026)</span>
                       </div>
                       <div className="flex items-start gap-1">
                         <span className="text-emerald-500 font-bold">✔</span>
                         <span><strong>Google AI for App Building Specialization</strong> (May 2026 · ID: GooglePM9)</span>
                       </div>
                     </div>
                   </div>

                 </div>

                 <div className="mt-8 text-xxs font-sans text-stone-550 font-semibold flex items-center justify-between border-t border-slate-100 pt-2 w-full">
                     <span>M. Sujitha — Technical PM / Resume Page 2</span>
                     <span>Page 2 of 2</span>
                 </div>
               </div>

             </div>
           )}
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className={`min-h-screen ${tc.bodyBg} transition-colors duration-200 pb-16 ${printLayout === "interactive" ? "print-interactive-mode" : "print-classic-mode"}`}>
      {/* HEADER CONTROL BAR (Hides on standard print) */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-display font-bold text-lg tracking-wider">
              SM
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-display font-bold tracking-tight text-slate-900">
                Sujitha Manivasagam
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Professional Interactive Executive Resume
              </span>
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-sm">
            
            {/* Visual Profile Preset Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Theme:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setTheme("slate")}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    theme === "slate" ? "bg-white text-slate-900 shadow-xs border border-slate-100" : "text-slate-600 hover:text-slate-900"
                  }`}
                  id="btn-theme-slate"
                >
                  Slate Corporate
                </button>
                <button
                  onClick={() => setTheme("emerald")}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    theme === "emerald" ? "bg-white text-emerald-900 shadow-xs border border-slate-100" : "text-slate-600 hover:text-emerald-900"
                  }`}
                  id="btn-theme-emerald"
                >
                  Teal Tech
                </button>
                <button
                  onClick={() => setTheme("crimson")}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    theme === "crimson" ? "bg-white text-rose-950 shadow-xs border border-slate-100" : "text-slate-600 hover:text-rose-900"
                  }`}
                  id="btn-theme-crimson"
                >
                  Crimson Elite
                </button>
              </div>
            </div>

            {/* Density Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Spacing:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setDensity("compact")}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    density === "compact" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                  id="btn-density-compact"
                >
                  Compact
                </button>
                <button
                  onClick={() => setDensity("normal")}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    density === "normal" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                  id="btn-density-normal"
                >
                  Normal
                </button>
                <button
                  onClick={() => setDensity("spacious")}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                    density === "spacious" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                  id="btn-density-spacious"
                >
                  Spacious
                </button>
              </div>
            </div>

            {/* Layout Format Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Format:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPrintLayout("interactive")}
                  className={`px-2 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                    printLayout === "interactive"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  id="btn-layout-interactive"
                  title="Interactive Dashboard: multi-tab grid with custom headers & tags"
                >
                  Interactive
                </button>
                <button
                  onClick={() => setPrintLayout("classic-split")}
                  className={`px-2 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                    printLayout === "classic-split"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  id="btn-layout-classic-split"
                  title="Split Sidebar CV: Ivory side-panel details with chronologies (Screenshot 1 Theme)"
                >
                  Split Sidebar
                </button>
                <button
                  onClick={() => setPrintLayout("classic-minimal")}
                  className={`px-2 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                    printLayout === "classic-minimal"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  id="btn-layout-classic-minimal"
                  title="Classic Minimalist: Clean horizontal lines ideal for traditional recruitment (Screenshot 2 Theme)"
                >
                  Minimalist
                </button>
              </div>
            </div>

            {/* Export Printable Action */}
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg font-medium text-xs transition-all shadow-xs cursor-pointer"
              id="btn-print-exporter"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
          </div>

        </div>
      </header>

      {/* PORTFOLIO WRAPPER SCREEN */}
      {printLayout === "interactive" ? (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 no-print">
        
        {/* INTERACTIVE BANNER */}
        <div className={`rounded-2xl ${tc.primary} border-l-[6px] border-l-blue-600 ${dentPaddings.cardPad} shadow-md overflow-hidden relative mb-6 sm:mb-8 transition-all`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-blue-500/20 to-transparent -mr-20 -mt-20 rounded-full pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Lead Meta */}
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Senior Technical PM & Architect Profile
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight mb-2">
                {resumeData.name}
              </h2>
              <p className="text-sm sm:text-lg text-white/80 max-w-4xl font-medium leading-relaxed font-sans">
                {aiResult?.tailoredHeadline || resumeData.headline}
              </p>
            </div>

            {/* Print/Save Fast Action Callout */}
            <div className="no-print bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col gap-2.5 min-w-[300px] lg:max-w-sm backdrop-blur-md">
              <p className="text-xs text-white/95 leading-relaxed font-bold">
                Download Resume Format:
              </p>
              
              {/* Inline format selector */}
              <div className="grid grid-cols-3 bg-black/20 p-0.5 rounded-lg border border-white/10 mb-1 text-[9px]">
                <button
                  onClick={() => setPrintLayout("interactive")}
                  className={`py-1.5 px-0.5 rounded font-bold tracking-wide transition-all cursor-pointer text-center ${
                    printLayout === "interactive"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                  title="Dashboard Style: Interactive Multi-Tab Layout"
                >
                  Interactive
                </button>
                <button
                  onClick={() => setPrintLayout("classic-split")}
                  className={`py-1.5 px-0.5 rounded font-bold tracking-wide transition-all cursor-pointer text-center ${
                    printLayout === "classic-split"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                  title="Split Sidebar Template (Screenshot 1)"
                >
                  Split CV
                </button>
                <button
                  onClick={() => setPrintLayout("classic-minimal")}
                  className={`py-1.5 px-0.5 rounded font-bold tracking-wide transition-all cursor-pointer text-center ${
                    printLayout === "classic-minimal"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                  title="Elegant Minimalist Template (Screenshot 2)"
                >
                  Minimalist
                </button>
              </div>

              {/* Theme Selector inside the Download Card */}
              <p className="text-[10px] text-white/90 leading-relaxed font-bold mt-1 uppercase tracking-wider">
                Select Design Theme:
              </p>
              <div className="grid grid-cols-3 bg-black/25 p-0.5 rounded-lg border border-white/15 mb-1">
                <button
                  onClick={() => setTheme("slate")}
                  className={`py-1.5 px-1 rounded-md font-bold text-[9px] tracking-wide transition-all cursor-pointer text-center ${
                    theme === "slate"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                  title="Professional clean deep slate navy style"
                >
                  Slate Corporate
                </button>
                <button
                  onClick={() => setTheme("emerald")}
                  className={`py-1.5 px-1 rounded-md font-bold text-[9px] tracking-wide transition-all cursor-pointer text-center ${
                    theme === "emerald"
                      ? "bg-white text-emerald-950 shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                  title="Energetic emerald details with modern tech borders"
                >
                  Teal Tech
                </button>
                <button
                  onClick={() => setTheme("crimson")}
                  className={`py-1.5 px-1 rounded-md font-bold text-[9px] tracking-wide transition-all cursor-pointer text-center ${
                    theme === "crimson"
                      ? "bg-white text-rose-950 shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                  title="Classical formal Crimson styled serif layout"
                >
                  Crimson Elite
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-slate-100 py-2.5 px-3 rounded-lg font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer w-full"
                  title={`Click to save high-fidelity PDF in ${printLayout === "interactive" ? "Interactive Dashboard" : "Classic CV"} layout`}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-900" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleDownloadDocx}
                  disabled={docxLoading}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg font-bold text-xs tracking-wide transition-all shadow-md w-full text-center cursor-pointer disabled:opacity-50"
                  title="Click to download formal editable MS Word Document (DOCX)"
                >
                  <FileText className={`w-3.5 h-3.5 ${docxLoading ? "animate-spin" : ""}`} />
                  <span>{docxLoading ? "Generating..." : "Download DOCX (Word)"}</span>
                </button>
              </div>
              <p className="text-[10px] text-white/70 italic text-center">
                *Active theme ({theme === "slate" ? "Slate Corporate" : theme === "emerald" ? "Teal Tech" : "Crimson Elite"}) applies exactly!
              </p>
            </div>

          </div>

          {/* Quick Contacts Panel */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-white/80">
            <button
              onClick={() => copyTextToClipboard(resumeData.contact.email, "email")}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
              title="Click to copy email address"
            >
              <Mail className="w-4 h-4 text-white/60 group-hover:text-white" />
              <span>{resumeData.contact.email}</span>
              {copiedContact === "email" && <span className="ml-1 text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded">Copied!</span>}
            </button>
            
            <button
              onClick={() => copyTextToClipboard(resumeData.contact.phone, "phone")}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
              title="Click to copy mobile number"
            >
              <Phone className="w-4 h-4 text-white/60 group-hover:text-white" />
              <span>{resumeData.contact.phone}</span>
              {copiedContact === "phone" && <span className="ml-1 text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded">Copied!</span>}
            </button>

            <a
              href={`https://${resumeData.contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors group"
            >
              <Linkedin className="w-4 h-4 text-white/60 group-hover:text-white" />
              <span className="underline decoration-white/20 hover:decoration-white">{resumeData.contact.linkedin}</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/40" />
            </a>

            <div className="flex items-center gap-1.5 text-white/60">
              <MapPin className="w-4 h-4" />
              <span>{resumeData.contact.location}</span>
            </div>
          </div>
        </div>

        {/* CORE DOCK DIVISION (Sidebar + Content Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION & STATIC SPECIFICATIONS (Cols 1-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Content Tab Selectors */}
            <div className={`rounded-xl bg-white border border-slate-200 ${dentPaddings.cardPad} shadow-xs`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                Portfolio Dashboard
              </h3>
              <nav className="flex flex-col gap-1.5">
                <a
                  href={getTabUrl("profile")}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("profile");
                  }}
                  className={`w-full flex items-center justify-between text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "profile"
                      ? `${tc.pills} ${tc.activePill} shadow-xs`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  id="tab-profile-trigger"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Executive Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href={getTabUrl("experience")}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("experience");
                  }}
                  className={`w-full flex items-center justify-between text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "experience"
                      ? `${tc.pills} ${tc.activePill} shadow-xs`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  id="tab-experience-trigger"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Experience Timeline</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
                    {resumeData.experience.length}
                  </span>
                </a>

                <a
                  href={getTabUrl("projects")}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("projects");
                  }}
                  className={`w-full flex items-center justify-between text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "projects"
                      ? `${tc.pills} ${tc.activePill} shadow-xs`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  id="tab-projects-trigger"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 className="w-4 h-4" />
                    <span>Key Project Highlights</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
                    {resumeData.projects.length}
                  </span>
                </a>

                <a
                  href={getTabUrl("certs")}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("certs");
                  }}
                  className={`w-full flex items-center justify-between text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "certs"
                      ? `${tc.pills} ${tc.activePill} shadow-xs`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  id="tab-certs-trigger"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4" />
                    <span>Certifications Ledger</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
                    {resumeData.certifications.length}
                  </span>
                </a>

                <a
                  href={getTabUrl("ai")}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("ai");
                  }}
                  className={`w-full flex items-center justify-between text-left py-2.5 px-3.5 rounded-lg text-sm font-semibold transition-all border border-dashed border-blue-200 cursor-pointer ${
                    activeTab === "ai"
                      ? "bg-blue-600 text-white shadow-xs border-solid"
                      : "bg-blue-50/50 text-blue-800 hover:bg-blue-150"
                  }`}
                  id="tab-ai-trigger"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="font-bold">AI Resume Matcher</span>
                  </div>
                  <span className="text-xxs bg-blue-600 text-white font-black px-1.5 py-0.5 rounded">NEW</span>
                </a>
              </nav>
            </div>

            {/* CORE EXECUTIVE COMPETENCIES CARD */}
            <div className={`rounded-xl bg-white border border-slate-200 ${dentPaddings.cardPad} shadow-xs flex flex-col gap-5`}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Top Focus Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.topSkills.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Backend Stack Capabilities
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.backendSkills.map((tech, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex px-2.5 py-1 rounded ${tc.badge} border text-xs font-semibold`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Management Frameworks
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.managementSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR COMPACT CERTIFICATIONS OVERVIEW */}
            <div className={`rounded-xl bg-white border border-slate-200 ${dentPaddings.cardPad} shadow-xs`}>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Credentials Highlight
                </h3>
                <button
                  onClick={() => setActiveTab("certs")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All {resumeData.certifications.length}
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">
                      Google PM Specialization
                    </h4>
                    <p className="text-xxs text-indigo-700 font-medium">
                      Google Career Certs · Verified
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-purple-950">
                      IBM + Google AI Focus
                    </h4>
                    <p className="text-xxs text-purple-700 font-medium font-sans">
                      12+ Specializations in Prompt Engineering & AI PM Workflow
                    </p>
                  </div>
                </div>
              </div>

              {/* Little stats strip */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-md">
                  <span className="block text-lg font-extrabold text-slate-800">{pmCertCount}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">PM Certs</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-md">
                  <span className="block text-lg font-extrabold text-slate-800">{aiCertCount}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">AI Certs</span>
                </div>
              </div>
            </div>

          </div>

          {/* MAIN DETAIL INTERFACE (Col span 8) */}
          <div className="lg:col-span-8">            <div className={`${tc.card} ${dentPaddings.cardPad} min-h-[500px] transition-all`}>
              
              {/* TAB 1: EXECUTIVE PROFILE */}
              {activeTab === "profile" && (
                <div id="profile" className={dentPaddings.sectionGap}>
                  
                  {/* Executive Summary */}
                  <div>
                    <h3 className={`flex items-center gap-2 ${tc.fontHeading}`}>
                      <UserCheck className={`w-5 h-5 ${tc.accentText}`} />
                      <span>Executive Summary</span>
                    </h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${tc.font === "font-serif" ? "font-serif text-stone-850" : "font-sans text-slate-650"}`}>
                      {aiResult?.tailoredSummary || resumeData.summary}
                    </p>
                  </div>

                  {/* Quantitative Career Indicators (Metrics) */}
                  <div>
                    <h3 className={`pb-2 mb-3 ${tc.fontTitle} text-base sm:text-lg`}>
                      Career Stats & Impact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <div className={`${tc.statCard}`}>
                        <span className={`text-3xl font-black block ${tc.font === 'font-serif' ? 'font-serif italic text-rose-950' : tc.font === 'font-mono' ? 'font-mono text-emerald-950' : 'font-display text-slate-900'}`}>13+</span>
                        <h4 className={`text-xs font-bold uppercase tracking-tight mt-1 ${tc.subAccent}`}>Yrs Experience</h4>
                        <p className={`text-xxs mt-0.5 leading-tight ${tc.badgeText}`}>Total Web Infrastructure & Leadership</p>
                      </div>

                      <div className={`${tc.statCard} ${theme === "slate" ? "bg-blue-50/40" : theme === "emerald" ? "bg-emerald-50/10" : "bg-stone-50"}`}>
                        <span className={`text-3xl font-black block ${tc.font === 'font-serif' ? 'font-serif italic text-rose-900' : tc.font === 'font-mono' ? 'font-mono text-emerald-800' : 'font-display text-blue-700'}`}>25%</span>
                        <h4 className={`text-xs font-bold uppercase tracking-tight mt-1 ${tc.subAccent}`}>Delivery Uplift</h4>
                        <p className={`text-xxs mt-0.5 leading-tight ${tc.badgeText}`}>Increased throughput with Sprint Retros</p>
                      </div>

                      <div className={`${tc.statCard} ${theme === "slate" ? "bg-emerald-50/30" : theme === "emerald" ? "bg-emerald-50/20" : "bg-stone-50"}`}>
                        <span className={`text-3xl font-black block ${tc.font === 'font-serif' ? 'font-serif italic text-rose-850' : tc.font === 'font-mono' ? 'font-mono text-emerald-700' : 'font-display text-emerald-700'}`}>10+</span>
                        <h4 className={`text-xs font-bold uppercase tracking-tight mt-1 ${tc.subAccent}`}>Team Members</h4>
                        <p className={`text-xxs mt-0.5 leading-tight ${tc.badgeText}`}>Led cross-functional engineers & design</p>
                      </div>

                      <div className={`${tc.statCard} ${theme === "slate" ? "bg-indigo-50/30" : theme === "emerald" ? "bg-emerald-50/15" : "bg-stone-50"}`}>
                        <span className={`text-3xl font-black block ${tc.font === 'font-serif' ? 'font-serif italic text-rose-900' : tc.font === 'font-mono' ? 'font-mono text-emerald-900' : 'font-display text-indigo-700'}`}>19</span>
                        <h4 className={`text-xs font-bold uppercase tracking-tight mt-1 ${tc.subAccent}`}>Specializations</h4>
                        <p className={`text-xxs mt-0.5 leading-tight ${tc.badgeText}`}>Accreditations from Google, IBM & SkillUp</p>
                      </div>

                    </div>
                  </div>

                  {/* Core Value Proposition Bulletins */}
                  <div>
                    <h3 className={`pb-1 mb-3 ${tc.fontTitle} text-base sm:text-lg`}>
                      The Technical PM Advantage
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 border border-dashed ${tc.lightBorder} ${tc.rounded}`}>
                        <h4 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${tc.font === "font-serif" ? "font-serif italic text-rose-950 font-bold" : tc.font === "font-mono" ? "font-mono text-emerald-950" : "text-slate-800"}`}>
                          <CheckCircle2 className={`w-4 h-4 ${tc.accentText}`} />
                          Pragmatic Tech Empathy
                        </h4>
                        <p className={`text-xs leading-relaxed ${tc.font === "font-serif" ? "font-serif text-stone-800" : "text-slate-500"}`}>
                          Started as a core PHP developer, giving her a deep, firsthand comprehension of database design, codebase maintenance hurdles, API parameters, and system scalability realities. Talks the developers' language, minimizing estimation gaps.
                        </p>
                      </div>

                      <div className={`p-4 border border-dashed ${tc.lightBorder} ${tc.rounded}`}>
                        <h4 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${tc.font === "font-serif" ? "font-serif italic text-rose-950 font-bold" : tc.font === "font-mono" ? "font-mono text-emerald-950" : "text-slate-800"}`}>
                          <CheckCircle2 className={`w-4 h-4 ${tc.accentText}`} />
                          Agile & Scrum Facilitation
                        </h4>
                        <p className={`text-xs leading-relaxed ${tc.font === "font-serif" ? "font-serif text-stone-800" : "text-slate-500"}`}>
                          Skilled in backlog grooming, continuous grooming workshops, scheduling constraints, requirement decompositions, and mitigating timeline risks. Uses sprint retrospectives specifically to eliminate delivery redundancies and improve productivity metrics.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Milestones */}
                  <div>
                    <h3 className={`pb-2 mb-3 ${tc.fontHeading}`}>
                      Education Overview
                    </h3>
                    <div className="space-y-4">
                      {resumeData.education.slice(0, 2).map((edu, idx) => (
                        <div key={idx} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border ${tc.lightBorder} ${tc.rounded} ${theme === "slate" ? "bg-slate-50" : theme === "emerald" ? "bg-emerald-50/15" : "bg-stone-50"}`}>
                          <div>
                            <span className={`px-2 py-0.5 rounded-full mb-1 inline-block ${tc.badge}`}>
                              {edu.period}
                            </span>
                            <h4 className={`text-sm font-bold ${tc.font === "font-serif" ? "font-serif text-stone-900" : tc.font === "font-mono" ? "font-mono text-emerald-950" : "text-slate-800"}`}>{edu.degree}</h4>
                            <p className={`text-xs ${tc.font === "font-serif" ? "font-serif text-stone-600" : "text-slate-500"}`}>{edu.school} {edu.university ? `| ${edu.university}` : ""}</p>
                          </div>
                          <div className="mt-2 sm:mt-0 text-left sm:text-right">
                            <span className={`text-xs font-bold uppercase tracking-tight block ${tc.font === "font-mono" ? "text-emerald-700" : "text-slate-400"}`}>Score</span>
                            <span className={`text-sm font-extrabold block ${tc.font === "font-serif" ? "font-serif italic text-rose-950" : tc.font === "font-mono" ? "font-mono text-emerald-900" : "text-slate-800"}`}>{edu.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: DETAILED EXPERIENCE TIMELINE */}
              {activeTab === "experience" && (
                <div id="experience">
                  <h3 className={`flex items-center gap-2 ${tc.fontHeading}`}>
                    <Briefcase className={`w-5 h-5 ${tc.accentText}`} />
                    <span>Chronological Work Experience</span>
                  </h3>

                  <p className={`text-xs mb-4 uppercase font-bold tracking-wide ${tc.subAccent}`}>
                    Click any role below to view quantitative highlights and responsibilities:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Role list sidebar (Cols 6) */}
                    <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {resumeData.experience.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => setSelectedExpId(exp.id)}
                          className={`w-full text-left p-3.5 border transition-all text-xs flex flex-col gap-1 inline-block cursor-pointer ${
                            selectedExpId === exp.id
                              ? theme === "slate"
                                ? "bg-slate-900 border-slate-900 text-white shadow-md scale-[1.01] rounded-xl"
                                : theme === "emerald"
                                ? "bg-emerald-850 border-emerald-900 text-white shadow-sm scale-[1.01] rounded-lg font-mono"
                                : "bg-rose-955 bg-rose-950 border-rose-950 text-white shadow-none font-serif italic rounded-none"
                              : theme === "slate"
                              ? "bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl"
                              : theme === "emerald"
                              ? "bg-emerald-50/20 border-emerald-250 border-dashed hover:bg-emerald-50/60 text-emerald-950 rounded-lg font-mono"
                              : "bg-stone-50 border-stone-250 hover:bg-stone-100/50 text-stone-850 rounded-none font-serif"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold tracking-tight uppercase ${selectedExpId === exp.id ? (theme === "slate" ? "text-blue-300" : theme === "emerald" ? "text-emerald-300" : "text-rose-200") : tc.accentText}`}>
                              {exp.company === "BrainCert (BrainCert India Pvt Ltd)" || exp.company === "BrainCert India Private Limited" ? "BrainCert" : exp.company}
                            </span>
                            <span className={`text-[10px] font-bold ${selectedExpId === exp.id ? "text-white/80" : tc.subAccent}`}>
                              {exp.duration}
                            </span>
                          </div>
                          <span className={`text-sm font-semibold tracking-tight ${selectedExpId === exp.id ? "text-white" : tc.font === "font-serif" ? "font-serif text-rose-950 font-bold" : tc.font === "font-mono" ? "font-mono text-emerald-900" : "text-slate-800"}`}>
                            {exp.role}
                          </span>
                          <span className={`${selectedExpId === exp.id ? "text-white/60" : "text-slate-500"}`}>
                            {exp.period}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Role active card detail (Cols 7) */}
                    <div className="md:col-span-7">
                      {selectedExpId ? (() => {
                        const exp = resumeData.experience.find((e) => e.id === selectedExpId);
                        if (!exp) return <div className="text-center text-slate-400 py-12">No experience role found.</div>;
                        return (
                          <div className={`${tc.cardOutline} p-5 border flex flex-col gap-4 animate-fadeIn ${theme === "slate" ? "bg-slate-50/40" : theme === "emerald" ? "bg-emerald-50/10" : "bg-stone-50/50"}`}>
                            
                            {/* Role title card header */}
                            <div>
                              <span className={`text-xxs font-extrabold tracking-widest uppercase mb-0.5 block ${tc.subAccent}`}>
                                Experience Detail Spotlight
                              </span>
                              <h4 className={`text-lg font-bold tracking-tight ${tc.fontTitle}`}>
                                {exp.role}
                              </h4>
                              <p className={`text-sm font-semibold ${tc.accentText}`}>
                                {exp.company}
                              </p>
                              <div className={`flex items-center gap-4 text-xxs font-bold uppercase tracking-wider mt-2 py-1.5 px-2.5 border w-fit ${tc.rounded} ${theme === "slate" ? "bg-white border-slate-100" : theme === "emerald" ? "bg-emerald-50/30 border-emerald-200" : "bg-stone-100 border-stone-250"}`}>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {exp.period}
                                </span>
                                <span>|</span>
                                <span>{exp.duration}</span>
                              </div>
                            </div>

                            {/* Achievements bullets */}
                            <div>
                              <h5 className={`text-xs font-bold uppercase tracking-wider mb-2 ${tc.subAccent}`}>
                                Key Deliverables & Impact:
                              </h5>
                              <ul className="space-y-3">
                                {exp.highlights.map((bullet, idx) => (
                                  <li key={idx} className={`flex items-start gap-2 text-xs leading-relaxed ${tc.font === "font-serif" ? "font-serif text-stone-800" : "font-sans text-slate-600"}`}>
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] mt-0.5 shrink-0 ${theme === "slate" ? "bg-slate-900/10 text-slate-900" : theme === "emerald" ? "bg-emerald-700/10 text-emerald-800" : "bg-rose-900/10 text-rose-900"}`}>
                                      {idx + 1}
                                    </span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Custom relevance suggestion wrapper (if AI tailored search was run) */}
                            {aiResult?.highlightedProjects.some((hp) => hp.projectId === exp.id) && (
                              <div className={`mt-2 p-3.5 border ${tc.rounded} ${theme === "slate" ? "bg-blue-50 border-blue-105" : theme === "emerald" ? "bg-emerald-50/30 border-emerald-200" : "bg-rose-50/30 border-rose-200"}`}>
                                <h6 className={`text-[11px] font-bold flex items-center gap-1 ${theme === "slate" ? "text-blue-900" : theme === "emerald" ? "text-emerald-900" : "text-rose-950"}`}>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  AI Focus Suggestion for this role
                                </h6>
                                <p className={`text-xxs leading-normal mt-1 ${theme === "slate" ? "text-blue-700" : theme === "emerald" ? "text-emerald-800" : "text-rose-800"}`}>
                                  {aiResult.highlightedProjects.find((hp) => hp.projectId === exp.id)?.matchingAngle}
                                </p>
                              </div>
                            )}

                          </div>
                        );
                      })() : (
                        <div className={`flex flex-col items-center justify-center py-20 select-none border border-dashed ${tc.lightBorder} ${tc.rounded} ${theme === "slate" ? "text-slate-350" : theme === "emerald" ? "text-emerald-300" : "text-stone-400"}`}>
                          <Sliders className="w-12 h-12 stroke-[1.25] mb-2" />
                          <p className={`text-xs font-semibold ${tc.font}`}>Select a career milestone on the left to explore impact</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: KEY PROJECTS DIRECTORY */}
              {activeTab === "projects" && (
                <div id="projects">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 mb-4 ${tc.lightBorder}`}>
                    <h3 className={`flex items-center gap-2 ${tc.fontHeading} border-none pb-0 mb-0`}>
                      <Code2 className={`w-5 h-5 ${tc.accentText}`} />
                      <span>Executive Project Highlights</span>
                    </h3>

                    {/* Quick Filters */}
                    <div className={`flex flex-wrap gap-1 p-0.5 border text-xxs font-semibold ${theme === "slate" ? "bg-slate-100 border-slate-200 rounded-lg" : theme === "emerald" ? "bg-emerald-50/20 border-emerald-250 border-dashed rounded-md font-mono" : "bg-stone-200 border-stone-300 rounded-none font-serif italic text-stone-855"}`}>
                      <button
                        onClick={() => setProjectFilter("all")}
                        className={`px-2 py-1 ${projectFilter === "all" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        All ({resumeData.projects.length})
                      </button>
                      <button
                        onClick={() => setProjectFilter("saas")}
                        className={`px-2 py-1 ${projectFilter === "saas" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        SaaS & LMS
                      </button>
                      <button
                        onClick={() => setProjectFilter("intranet")}
                        className={`px-2 py-1 ${projectFilter === "intranet" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        Intranet & CRM
                      </button>
                      <button
                        onClick={() => setProjectFilter("custom")}
                        className={`px-2 py-1 ${projectFilter === "custom" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        Web Integrations
                      </button>
                      <button
                        onClick={() => setProjectFilter("db")}
                        className={`px-2 py-1 ${projectFilter === "db" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        DB Optimized
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-4 relative">
                    <Search className={`absolute left-3.5 top-2.5 w-4.5 h-4.5 ${theme === "slate" ? "text-slate-400" : theme === "emerald" ? "text-emerald-500" : "text-stone-400"}`} />
                    <input
                      type="text"
                      placeholder="Search projects by tech (e.g., 'Laravel', 'Joomla', 'jQuery', 'MySQL')..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border text-sm focus:outline-none focus:ring-2 text-slate-850 ${
                        theme === "slate"
                          ? "bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:bg-white"
                          : theme === "emerald"
                          ? "bg-emerald-50/15 border-emerald-250 border-dashed rounded-lg focus:ring-emerald-700 font-mono text-emerald-950 focus:bg-white"
                          : "bg-stone-50 border-stone-300 rounded-none focus:ring-rose-800 font-serif text-stone-900 focus:bg-stone-100"
                      }`}
                    />
                  </div>

                  {/* Key grid of projects */}
                  {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProjects.map((p) => (
                        <div key={p.id} className={`border p-4 transition-all flex flex-col justify-between hover:shadow-xs group ${theme === "slate" ? "border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/50" : theme === "emerald" ? "border-emerald-350 border-dashed rounded-lg bg-white hover:bg-emerald-50/10" : "border-stone-350 rounded-none bg-stone-50 hover:bg-stone-100/40"}`}>
                          <div>
                            {/* Project header details */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className={`text-sm font-bold leading-tight group-hover:transition-colors ${theme === "slate" ? "text-slate-900 group-hover:text-blue-600" : theme === "emerald" ? "text-emerald-950 font-mono group-hover:text-emerald-700" : "text-stone-950 font-serif group-hover:text-rose-850"}`}>
                                {p.url ? (
                                  <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex items-center gap-1.5 inline-flex cursor-pointer"
                                    title="Visit live project site"
                                  >
                                    <span>{p.name}</span>
                                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                                  </a>
                                ) : (
                                  p.name
                                )}
                              </h4>
                              {p.url && (
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`shrink-0 ${theme === "slate" ? "text-slate-400 hover:text-blue-600" : theme === "emerald" ? "text-emerald-450 hover:text-emerald-700" : "text-stone-400 hover:text-rose-800"}`}
                                  title="Visit live site / project overview"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Database field if exists */}
                            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === "emerald" ? "font-mono text-emerald-600" : "text-slate-400"}`}>
                              <Layers className="w-3 h-3" />
                              <span>Database: {p.database || "MySQL"}</span>
                            </div>

                            {/* Description brief */}
                            <p className={`text-xs leading-relaxed mb-4 ${tc.font === "font-serif" ? "font-serif text-stone-800" : "text-slate-500"}`}>
                              {p.description}
                            </p>
                          </div>

                          <div>
                            {/* Technical Relevance block */}
                            <div className={`p-2.5 border mb-3 ${theme === "slate" ? "bg-white border-slate-100 rounded-lg" : theme === "emerald" ? "bg-emerald-50/20 border-emerald-250 border-dashed rounded-md font-mono" : "bg-stone-100 border-stone-250 rounded-none font-serif"}`}>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Relevance to Project Delivery:
                              </span>
                              <ul className="list-inside space-y-1">
                                {p.relevance.map((rel, rIdx) => (
                                  <li key={rIdx} className={`text-[10px] list-disc leading-normal pl-0.5 ${theme === "emerald" ? "text-emerald-950" : "text-slate-500"}`}>
                                    {rel}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Tech pills tags */}
                            <div className="flex flex-wrap gap-1">
                              {p.techStack.map((tech, tIdx) => (
                                <span key={tIdx} className={`px-2 py-0.5 border text-[10px] font-medium ${tc.badge}`}>
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-16 select-none border border-dashed rounded-xl bg-slate-50/50 ${tc.lightBorder}`}>
                      <ExternalLink className="w-10 h-10 stroke-[1.25] text-slate-350 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No projects matching your filtered search term.</p>
                      <button
                        onClick={() => { setProjectSearch(""); setProjectFilter("all"); }}
                        className={`text-xs underline font-semibold mt-2 ${theme === "slate" ? "text-blue-600 hover:text-blue-700" : theme === "emerald" ? "text-emerald-700 hover:text-emerald-800" : "text-rose-850 hover:text-rose-950"}`}
                      >
                        Reset search filters
                      </button>
                    </div>
                  )}

                  {/* Quick summary advisory footer */}
                  <div className="mt-5 p-3.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-950 text-xs">
                    💡 <strong>Hands-on Delivery Spotlight:</strong> These projects represent real, live client deliverables built across Sujitha's 13+ years. They proof her capability to manage massive codebases (Joomla, Custom Wordpress frameworks, CodeIgniter, Laravel) alongside client integrations.
                  </div>
                </div>
              )}

              {/* TAB 4: CERTIFICATIONS & CREDENTIALS LEDGER */}
              {activeTab === "certs" && (
                <div id="certs">
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 mb-4 ${tc.lightBorder}`}>
                    <div>
                      <h3 className={`flex items-center gap-2 ${tc.fontHeading} border-none pb-0 mb-0`}>
                        <Award className={`w-5 h-5 ${tc.accentText}`} />
                        <span>Professional Credentials Ledger</span>
                      </h3>
                      <p className={`text-xxs font-medium ${tc.subAccent}`}>
                        Verification tracking for M. Sujitha's achievements ({resumeData.certifications.length} Credentials)
                      </p>
                    </div>

                    {/* Filter categories */}
                    <div className={`flex p-0.5 border text-xxs font-semibold ${theme === "slate" ? "bg-slate-100 border-slate-200 rounded-lg" : theme === "emerald" ? "bg-emerald-50/20 border-emerald-250 border-dashed rounded-md font-mono" : "bg-stone-200 border-stone-300 rounded-none font-serif italic text-stone-800"}`}>
                      <button
                        onClick={() => setCertFilter("all")}
                        className={`px-2 py-1 ${certFilter === "all" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        All ({resumeData.certifications.length})
                      </button>
                      <button
                        onClick={() => setCertFilter("ai")}
                        className={`px-2 py-1 ${certFilter === "ai" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        AI ({aiCertCount})
                      </button>
                      <button
                        onClick={() => setCertFilter("pm")}
                        className={`px-2 py-1 ${certFilter === "pm" ? (theme === "slate" ? "bg-white text-slate-900 shadow-xs rounded-md" : theme === "emerald" ? "bg-emerald-800 text-white rounded-sm" : "bg-rose-950 text-white rounded-none") : "text-slate-600 hover:text-slate-900"}`}
                      >
                        PM & Scrum ({pmCertCount})
                      </button>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="mb-4 relative">
                    <Search className={`absolute left-3.5 top-2.5 w-4.5 h-4.5 ${theme === "slate" ? "text-slate-400" : theme === "emerald" ? "text-emerald-500" : "text-stone-400"}`} />
                    <input
                      type="text"
                      placeholder="Search details by credential name, issuer, or verification ID..."
                      value={certSearch}
                      onChange={(e) => setCertSearch(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border text-sm focus:outline-none focus:ring-2 text-slate-850 ${
                        theme === "slate"
                          ? "bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:bg-white"
                          : theme === "emerald"
                          ? "bg-emerald-50/15 border-emerald-250 border-dashed rounded-lg focus:ring-emerald-700 font-mono text-emerald-950 focus:bg-white"
                          : "bg-stone-50 border-stone-300 rounded-none focus:ring-rose-800 font-serif text-stone-900 focus:bg-stone-100"
                      }`}
                    />
                  </div>

                  {/* Scrollable grid ledger cards */}
                  {filteredCerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
                      {filteredCerts.map((cert, idx) => {
                        const isAI = cert.name.toLowerCase().includes("ai") || cert.name.toLowerCase().includes("generative") || cert.name.toLowerCase().includes("prompt");
                        return (
                          <div
                            key={idx}
                            className={`p-3 border flex flex-col justify-between ${
                              theme === "slate"
                                ? isAI ? "bg-purple-50/40 border-purple-105 rounded-xl" : "bg-blue-50/40 border-blue-105 rounded-xl"
                                : theme === "emerald"
                                ? isAI ? "bg-emerald-50/20 border-emerald-350 border-dashed rounded-lg font-mono text-emerald-950" : "bg-emerald-50/10 border-emerald-250 border-dashed rounded-lg font-mono text-emerald-900"
                                : isAI ? "bg-stone-50 border-stone-350 rounded-none font-serif text-stone-900" : "bg-stone-100/40 border-stone-300 rounded-none font-serif text-stone-900"
                            }`}
                          >
                            <div className="flex gap-2.5">
                              <span className={`p-2 border self-start ${theme === "slate" ? "rounded-lg" : theme === "emerald" ? "rounded bg-emerald-50 border-emerald-200" : "rounded-none bg-stone-100 border-stone-300"} ${isAI ? "text-purple-750 text-purple-600" : "text-blue-750 text-blue-600"}`}>
                                {isAI ? <Cpu className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                              </span>
                              <div>
                                <h4 className={`text-xs font-bold leading-tight ${theme === "slate" ? "text-slate-900" : theme === "emerald" ? "text-emerald-950 font-mono" : "text-stone-900 font-serif"}`}>
                                  {cert.name}
                                </h4>
                                <p className={`text-[10px] font-semibold mt-0.5 ${theme === "emerald" ? "font-mono text-emerald-700/80" : "text-slate-500"}`}>
                                  Issued by {cert.issuer} · {cert.date}
                                </p>
                              </div>
                            </div>

                            {cert.credentialId && (
                              <div className={`mt-3.5 pt-2 border-t flex items-center justify-between text-[10px] ${theme === "emerald" ? "border-emerald-200 border-dashed" : "border-slate-100"}`}>
                                <span className={`font-mono ${theme === "emerald" ? "text-emerald-600/70" : "text-slate-400"}`}>Credential ID: {cert.credentialId}</span>
                                <a
                                  href={`https://www.coursera.org/verify/${cert.credentialId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-1 font-bold hover:underline transition-all cursor-pointer ${isAI ? "text-purple-650 hover:text-purple-800" : `${tc.accentText} hover:opacity-85`} decoration-dotted`}
                                  title="Verify this certification live on Coursera"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Verify Credential ↗</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`text-center py-16 select-none border border-dashed rounded-xl bg-slate-50/50 ${tc.lightBorder}`}>
                      <Award className="w-10 h-10 stroke-[1.25] text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No certifications match your query criteria.</p>
                      <button
                        onClick={() => { setCertSearch(""); setCertFilter("all"); }}
                        className={`text-xs underline font-semibold mt-2 ${theme === "slate" ? "text-blue-600 hover:text-blue-700" : theme === "emerald" ? "text-emerald-700 hover:text-emerald-800" : "text-rose-850 hover:text-rose-950"}`}
                      >
                        Reset search filters
                      </button>
                    </div>
                  )}

                  {/* Academic list addition segment */}
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                      Academic Background Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                      <div className="p-3.5 bg-white border border-slate-100 rounded-lg">
                        <span className="text-[10px] font-bold text-blue-700 block mb-0.5">Master Degree</span>
                        <h5 className="font-bold text-slate-900 text-xs">Master of Computer Applications (MCA)</h5>
                        <p className="text-xxs text-slate-400 font-semibold leading-normal mt-0.5">SRIT Coimbatore · Anna University (80% / 75%)</p>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-100 rounded-lg">
                        <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">Bachelor Degree</span>
                        <h5 className="font-bold text-slate-900 text-xs">B.Sc. in Computer Science</h5>
                        <p className="text-xxs text-slate-400 font-semibold leading-normal mt-0.5">Vellalar College for Women · Erode (67.53%)</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: AI RESUME OPTIMIZER / MATCHING ENGINE */}
              {activeTab === "ai" && (
                <div id="ai" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                      AI Resume Matching & Alignment Tailor
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Provide any Job Description below to evaluate matching statistics. The server-side Gemini AI engine will analyze Sujitha's 13+ years backgrounds against the requirement, calculate scores, outline key strengths, highlights optimal projects, and author a tailored cover letter.
                    </p>
                  </div>

                  {/* Predefined Vacancies Selection Drawer */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      1-Click Sample Vacancies (Loads instantly):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {jobTemplates.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLoadTemplate(idx)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                            currentSelectedTemplate === idx
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <div>
                            <span className="block font-bold leading-snug">{item.title}</span>
                            <span className={`text-[10px] block mt-1 ${currentSelectedTemplate === idx ? "text-slate-350" : "text-slate-400"}`}>
                              {item.company}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider block mt-3.5 underline`}>
                            {currentSelectedTemplate === idx ? "Loaded" : "Click to load"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text pasting area */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Job Description:
                      </label>
                      <button
                        onClick={() => { setCustomJobDesc(""); setCurrentSelectedTemplate(null); }}
                        className="text-xs font-semibold text-slate-500 hover:text-red-500"
                      >
                        Clear area
                      </button>
                    </div>

                    <textarea
                      value={customJobDesc}
                      onChange={(e) => setCustomJobDesc(e.target.value)}
                      placeholder="Paste your specific job description requirements here (or select one of the sample templates above) to evaluate alignment..."
                      className="w-full h-44 p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 font-mono leading-relaxed resize-none"
                    />
                  </div>

                  {/* Submission line */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xxs text-slate-400 leading-normal max-w-lg">
                      🔒 <strong>Security Policy:</strong> Analysis executes server-side using modern sandboxed Gemini protocols. Your secret API key is hidden from browsers and remains secure.
                    </div>
                    
                    <button
                      onClick={handleAnalyzeJobDescription}
                      disabled={aiLoading}
                      className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                        aiLoading
                          ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      id="btn-analyze-jd"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                          <span>Matching Profile via Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4.5 h-4.5 text-yellow-300" />
                          <span>Analyze Matching Alignments</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Loading Message Board */}
                  {aiLoading && (
                    <div className="p-5 border border-blue-105 bg-blue-50/30 rounded-xl animate-pulse space-y-2">
                      <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Performing Deep Profile Correlations
                      </h4>
                      <p className="text-xxs text-blue-700 leading-relaxed">
                        Evaluating 13 years of PHP/Joomla/Laravel code management, auditing 19 certified specializations from Google & IBM, analyzing timeline optimizations, mapping agile milestones, and generating customized cover letters. Please stand by...
                      </p>
                    </div>
                  )}

                  {/* AI Error Screen */}
                  {aiError && (
                    <div className="p-4 bg-red-50 border border-red-105 rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-red-950">AI Extraction Abruptly Paused</h4>
                        <p className="text-xs text-red-700 mt-0.5 select-all leading-normal">
                          {aiError}
                        </p>
                        <div className="mt-3.5 p-3 bg-red-100/50 rounded-lg text-xxs text-slate-800 leading-normal max-w-xl">
                          🔧 <strong>Dev Tip:</strong> Confirm that you have appended a valid <strong>`GEMINI_API_KEY`</strong> into your **Settings &gt; Secrets** panel in AI Studio, and that the server has booted properly.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI COMPILATION RESULTS DASHBOARD */}
                  {aiResult && (
                    <div className={`border ${tc.lightBorder} ${tc.rounded} p-5 bg-white flex flex-col gap-5 animate-fadeIn shadow-xs`}>
                      
                      {/* Gauge Indicator Header */}
                      <div className={`flex flex-col sm:flex-row items-center justify-between gap-5 border-b pb-4 ${tc.lightBorder}`}>
                        <div className="flex items-center gap-3.5">
                          {/* Radial dial score */}
                          <div className={`relative w-18 h-18 rounded-full border-4 border-slate-100 flex items-center justify-center font-display font-extrabold text-xl ${tc.font === "font-serif" ? "font-serif text-rose-950" : tc.font === "font-mono" ? "font-mono text-emerald-950" : "text-slate-900"} bg-white`}>
                            <span className="text-2xl font-black">{aiResult.score}</span>
                            <span className="text-[10px] text-slate-450 font-bold">%</span>
                            {/* SVG indicator overlay */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle
                                cx="36"
                                cy="36"
                                r="32"
                                stroke={theme === "slate" ? "#1b365d" : theme === "emerald" ? "#064e40" : "#be123c"}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={200}
                                strokeDashoffset={200 - (200 * aiResult.score) / 100}
                                className="transition-all duration-1000"
                              />
                            </svg>
                          </div>
                          <div>
                            <span className={`text-xxs font-extrabold tracking-wider uppercase block ${tc.accentText}`}>
                              Resume Correlation Score
                            </span>
                            <h4 className={`text-base font-bold ${tc.font === "font-serif" ? "font-serif text-stone-900" : tc.font === "font-mono" ? "font-mono text-emerald-950" : "text-slate-900"}`}>
                              {aiResult.score >= 85 ? "Distinguished Capability Match" : aiResult.score >= 60 ? "Strong Foundational Fit" : "Development Match"}
                            </h4>
                            <p className="text-xxs text-slate-500 font-medium leading-tight mt-0.5 font-sans">
                              Successfully correlated key achievements against instructions
                            </p>
                          </div>
                        </div>

                        {/* Interactive Apply focus adjustments */}
                        <div className="text-right select-none">
                          <span className="text-xxs text-slate-400 font-bold uppercase tracking-widest block">
                            Dynamic Overlay
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 ${tc.badge} inline-block mt-1`}>
                            ✔ Match Complete
                          </span>
                        </div>
                      </div>

                      {/* Tailored Headline/Header Proposal */}
                      <div className={`p-4 ${theme === "slate" ? "bg-slate-50 border-slate-200" : theme === "emerald" ? "bg-emerald-50/15 border-emerald-150" : "bg-stone-50 border-stone-200"} border ${tc.rounded}`}>
                        <span className={`text-[10px] font-bold uppercase block mb-1.5 ${tc.subAccent}`}>
                          Recommended Optimized Resume Banner Headline:
                        </span>
                        <div className={`p-3 bg-white rounded border ${tc.lightBorder} font-semibold ${tc.font === "font-serif" ? "font-serif" : tc.font === "font-mono" ? "font-mono text-[11px]" : "font-sans"} text-slate-800 select-all text-xs pl-3 relative border-l-4 ${theme === "slate" ? "border-l-blue-600" : theme === "emerald" ? "border-l-emerald-600" : "border-l-rose-700"}`} style={{ wordBreak: "break-word" }}>
                          {aiResult.tailoredHeadline || "(No tailored headline suggested)"}
                        </div>
                      </div>

                      {/* Tailored Executive Summary Proposal */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 font-sans">
                          Recommended Resume Summary Overlay:
                        </span>
                        <p className={`text-xs sm:text-sm leading-relaxed p-3.5 rounded-lg border ${theme === "slate" ? "bg-slate-50/50 border-slate-200 text-slate-700" : theme === "emerald" ? "bg-emerald-50/10 border-emerald-200/50 text-emerald-900" : "bg-stone-50/50 border-stone-200 text-stone-800"} ${tc.font} relative pr-4`}>
                          {aiResult.tailoredSummary || "(No summary recommended)"}
                        </p>
                      </div>

                      {/* Strengths and gaps list split */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-3.5 ${theme === "slate" ? "bg-blue-50/30 border-blue-105" : theme === "emerald" ? "bg-teal-50/20 border-teal-150" : "bg-rose-50/20 border-rose-105"} border rounded-xl`}>
                          <h5 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${theme === "slate" ? "text-blue-950" : theme === "emerald" ? "text-teal-950" : "text-rose-950"}`}>
                            <CheckCircle2 className={`w-4 h-4 ${theme === "slate" ? "text-blue-600" : theme === "emerald" ? "text-teal-600" : "text-rose-600"}`} />
                            Core Fit Strengths:
                          </h5>
                          <ul className={`space-y-1.5 list-inside text-xs ${tc.font === "font-mono" ? "font-mono" : tc.font === "font-serif" ? "font-serif" : "font-sans"} ${theme === "slate" ? "text-slate-700" : theme === "emerald" ? "text-slate-700" : "text-stone-750"}`}>
                            {aiResult.strengths.map((str, idx) => (
                              <li key={idx} className="list-disc text-xxs leading-relaxed pl-0.5">
                                {str}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={`p-3.5 ${theme === "slate" ? "bg-slate-50 border-slate-200" : theme === "emerald" ? "bg-slate-50/60 border-slate-200" : "bg-stone-50/60 border-stone-200"} border rounded-xl`}>
                          <h5 className="text-xs font-bold text-slate-755 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-slate-500" />
                            Adaptation Gaps:
                          </h5>
                          <ul className={`space-y-1.5 list-inside text-xs ${tc.font === "font-mono" ? "font-mono" : tc.font === "font-serif" ? "font-serif" : "font-sans"} ${theme === "slate" ? "text-slate-600" : theme === "emerald" ? "text-slate-650" : "text-stone-700"}`}>
                            {aiResult.gaps.map((gp, idx) => (
                              <li key={idx} className="list-disc text-xxs leading-relaxed pl-0.5">
                                {gp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Recommended prioritized projects */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 font-sans">
                          Recommended Project Spotlight Order for this application:
                        </span>
                        <div className="space-y-2">
                          {aiResult.highlightedProjects.map((hp, idx) => (
                            <div key={idx} className={`p-3 bg-white border border-slate-200 ${tc.rounded} flex items-start gap-2 text-xs hover:border-slate-350 transition-colors`}>
                              <span className={`w-5 h-5 rounded-md ${tc.primary} text-slate-100 flex items-center justify-center font-display font-semibold shrink-0 text-xxs`}>
                                {idx + 1}
                              </span>
                              <div>
                                <h6 className={`font-bold ${theme === "crimson" ? "font-serif text-stone-900" : "text-slate-900"}`}>
                                  {hp.projectName}
                                </h6>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans">
                                  {hp.matchingAngle}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Talking Points for Interview Prep */}
                      <div className={`p-4 ${theme === "slate" ? "bg-amber-50/40 border-amber-100" : theme === "emerald" ? "bg-amber-50/20 border-amber-200/40" : "bg-stone-50/50 border-amber-200/50"} border rounded-xl`}>
                        <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2.5 flex items-center gap-1 font-sans">
                          <ThumbsUp className="w-4 h-4 text-amber-600" />
                          Recommended Interview Prep Talking Points:
                        </h5>
                        <ul className={`space-y-2 list-inside text-xs ${tc.font} text-slate-650`}>
                          {aiResult.interviewPrep.map((item, idx) => (
                            <li key={idx} className="list-disc text-xxs leading-relaxed pl-0.5">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cover letter generator */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                            Tailored Persuasive Cover Letter:
                          </span>
                          
                          <button
                            onClick={() => copyTextToClipboard(aiResult.coverLetter, "cover")}
                            className={`text-xs font-bold leading-none ${theme === "slate" ? "text-slate-800 bg-slate-105 hover:bg-slate-200 border-slate-250" : theme === "emerald" ? "text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border-emerald-250" : "text-rose-950 bg-rose-50 hover:bg-rose-100 border-rose-250"} flex items-center gap-1.5 py-1.5 px-3 rounded-lg border cursor-pointer select-none`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCoverLetter ? "Copied!" : "Copy to Clipboard"}</span>
                          </button>
                        </div>

                        <div className={`p-4 bg-slate-50 border ${tc.lightBorder} ${tc.rounded} text-xs text-slate-650 leading-relaxed font-serif whitespace-pre-wrap pl-4 border-l-4 ${theme === "slate" ? "border-l-blue-600/60" : theme === "emerald" ? "border-l-teal-600/60" : "border-l-rose-700/60"}`}>
                          {aiResult.coverLetter}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </main>
      ) : (
        <main className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 animate-fadeIn">
          {/* Real-time interactive paper previews */}
          {renderClassicDeskView()}
        </main>
      )}

      {/* FOOTER NOTE no-print */}
      <footer className="no-print mt-16 border-t border-slate-200 pt-8 text-center text-xs text-slate-400 max-w-7xl mx-auto px-4 sm:px-6">
        <p>© 2026 Sujitha Manivasagam. All Rights Reserved. Fully sandboxed prototype.</p>
        <p className="mt-1">Crafted utilizing Tailwind CSS, React, and server-side Google Gemini Models.</p>
      </footer>

      {/* ======================================================= */}
      {/* PERFECT STANDARD PRINT-ONLY PRISTINE 2-PAGE RESUME BLOCK */}
      {/* ======================================================= */}
      <div className={`print-only hidden print:block print-margin-none print-no-shadow print-full-width text-[10.5pt] ${theme === "crimson" ? "font-serif" : "font-sans"} ${classicColors[theme].primaryText}`}>
        {renderClassicSheetsOnly(theme, printLayout === "interactive" ? "classic-split" : printLayout, density)}
        <div className="hidden">
          {printLayout === "classic-split" ? (
          /* =================================================== */
          /* PRINT CORE: 2-COLUMN SPLIT SIDEBAR (Screenshot 1 Theme) */
          /* =================================================== */
          <div className="flex flex-row gap-5 items-stretch min-h-[1100px]">
            
            {/* Left printing sidebar strip */}
            <div className={`w-48 shrink-0 ${theme === 'crimson' ? 'bg-[#f5f1ea]' : theme === 'emerald' ? 'bg-[#edf5f2]' : 'bg-slate-50'} p-4 border-r border-slate-200/80 flex flex-col justify-between`}>
              <div>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border font-extrabold uppercase mb-2 ${theme === "slate" ? "border-slate-800 bg-slate-900 text-white" : theme === "emerald" ? "border-[#054035] bg-[#064e40] text-emerald-100" : "border-[#37000d] bg-[#4c0519] text-[#fdd1d9]"} text-sm tracking-wider`}>
                     SM
                  </div>
                  <h2 className="text-xs font-extrabold uppercase tracking-tight">{resumeData.name}</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">PM & Architect</p>
                </div>

                <div className="mt-6 space-y-3.5">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-slate-400 block border-b border-slate-200/60 pb-1">Contact</span>
                  <div className="space-y-3 text-[9px] text-slate-650 leading-tight">
                    <p>sujitha29@gmail.com</p>
                    <p>+91 9943396016</p>
                    <p>Coimbatore, India</p>
                    <p className="underline break-all text-blue-600">linkedin.com/in/sm</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3.5">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-slate-400 block border-b border-slate-200/60 pb-1">PM Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resumeData.topSkills.slice(0, 5).map((sk) => (
                      <span key={sk} className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200/50 bg-white">{sk}</span>
                    ))}
                  </div>
                  
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-slate-400 block border-b border-slate-200/60 pb-1 mt-4">Backend Stacks</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resumeData.backendSkills.slice(0, 6).map((sk) => (
                      <span key={sk} className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200/50 bg-white">{sk}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-6 text-[8.5px] leading-tight text-slate-500">
                 <strong>Master of Computer Applications</strong>
                 <p className="mt-0.5 font-bold">Anna University ∙ 2009</p>
              </div>
            </div>

            {/* Right printing column */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div>
                  <h1 className="text-lg font-extrabold uppercase tracking-tight">{resumeData.name}</h1>
                  <p className={`text-[10px] font-bold mt-0.5 italic ${classicColors[theme].accentText}`}>
                    {aiResult?.tailoredHeadline || resumeData.headline}
                  </p>
                  <p className="text-[9.5px] text-slate-600 leading-relaxed mt-2 text-justify">
                    {aiResult?.tailoredSummary || resumeData.summary}
                  </p>
                </div>

                <div className="mt-4">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${classicColors[theme].accentText} border-b border-slate-200 block mb-2`}>
                    Professional Experience Chronology
                  </span>
                  <div className="space-y-3 font-sans">
                    {resumeData.experience.slice(0, 3).map((exp) => (
                      <div key={exp.id} className="text-[9px] leading-relaxed">
                        <div className="flex items-start justify-between font-bold text-xxs gap-2">
                          <span className="font-bold text-slate-900">{exp.role.toUpperCase()} ∙ {exp.company.toUpperCase()}</span>
                          <span className={`font-semibold font-mono ${classicColors[theme].accentText} shrink-0`}>{exp.period}</span>
                        </div>
                        <p className="text-[8.5px] text-slate-400 font-semibold">{exp.location}</p>
                        <ul className="list-disc pl-3 text-[9px] text-slate-600 space-y-0.5 mt-1 font-normal">
                          {exp.highlights.slice(0, 2).map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <span className={`text-[9px] font-extrabold uppercase tracking-widest ${classicColors[theme].accentText} border-b border-slate-200 block mb-2`}>
                  Key Projects & Certifications
                </span>
                <div className="grid grid-cols-2 gap-x-4 text-[8.5px] leading-tight text-slate-650">
                  <div className="space-y-1">
                    <p><strong>1. BrainCert UTP Learning Platform</strong></p>
                    <p><strong>2. JDByrider Parts Procurement System</strong></p>
                    <p><strong>3. Citycreek Mortgage Map Calculator</strong></p>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <p>✔ Google PM Spec. (<a href="https://www.coursera.org/verify/QHEJG8WJLSZL" target="_blank" className="underline font-bold text-blue-700">QHEJG8WJLSZL</a>)</p>
                    <p>✔ IBM Generative AI Prompt Basics (IBMCC24)</p>
                    <p>✔ IBM Generative AI for Project Managers Specialization</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* =================================================== */
          /* PRINT CORE: MINIMALIST REGULAR LAYOUT (Screenshot 2 Theme) */
          /* =================================================== */
          <div>
            {/* Print Header Core Address Info */}
            <div className={`border-b-2 ${classicColors[theme].border} pb-4 mb-4 text-center`}>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight">
                M. Sujitha
              </h2>
              <p className={`text-xs font-bold tracking-wider ${classicColors[theme].secondaryText} italic mt-0.5`}>
                Technical Project Manager | Agile & Scrum Delivery | Senior Web Architect
              </p>
              <div className="flex items-center justify-center gap-x-5 gap-y-1 text-xxs text-slate-500 flex-wrap mt-2 font-mono">
                <span>Email: sujitha29@gmail.com</span>
                <span>|</span>
                <span>Phone: +91 9943396016</span>
                <span>|</span>
                <span>LinkedIn: <a href="https://www.linkedin.com/in/sujitha-manivasagam-6baa69358" target="_blank" className="underline font-bold text-blue-700">linkedin.com/in/sujitha-manivasagam-6baa69358</a></span>
                <span>|</span>
                <span>Location: Coimbatore, India</span>
              </div>
            </div>

            {/* PRINT Summary section */}
            <div className="mb-5">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest border-b ${classicColors[theme].subborder} pb-0.5 mb-1.5 font-bold`}>
                Executive Summary
              </h3>
              <p className={`text-xxs ${classicColors[theme].paragraphText} leading-relaxed font-sans`}>
                Accomplished Technical Project Manager and Senior Developer with over 13 years of expertise in software engineering and cross-functional project delivery. Specializing in building scalable web applications, managing end-to-end SDLC lifecycles, and elevating delivery throughput by 20–25%. Evolved from a hands-on PHP developer into strategic leadership, creating a powerful fusion of deep technical knowledge and Agile management principles.
              </p>
            </div>

            {/* PRINT Skills segment */}
            <div className="mb-5">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest border-b ${classicColors[theme].subborder} pb-0.5 mb-2 font-bold`}>
                Core Competencies & Stack Checklist
              </h3>
              <div className="grid grid-cols-3 gap-2.5 text-xxs font-sans">
                <div className={`p-2.5 rounded-lg border ${classicColors[theme].subborder} bg-slate-50/50`}>
                  <strong className={`block mb-1 text-[9px] uppercase tracking-wide ${classicColors[theme].accentText}`}>PM Frameworks:</strong>
                  <p className={`text-[10px] ${classicColors[theme].secondaryText} leading-tight`}>
                    Agile/Scrum, Sprint Planning, Backlog Grooming, Risk Mitigation, Milestone Management, Team Facilitations
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg border ${classicColors[theme].subborder} bg-slate-50/50`}>
                  <strong className={`block mb-1 text-[9px] uppercase tracking-wide ${classicColors[theme].accentText}`}>Backend Code stacks:</strong>
                  <p className={`text-[10px] ${classicColors[theme].secondaryText} leading-tight`}>
                    PHP, Laravel (4.2-5.3), CodeIgniter, Slim PHP, MySQL design, Joomla Frameworks, APIs, Web Sockets
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg border ${classicColors[theme].subborder} bg-slate-50/50`}>
                  <strong className={`block mb-1 text-[9px] uppercase tracking-wide ${classicColors[theme].accentText}`}>Emerging & AI tools:</strong>
                  <p className={`text-[10px] ${classicColors[theme].secondaryText} leading-tight`}>
                    Generative AI Workflows, Prompt Engineering, Prompt Architecting, AI Automation in SDLC
                  </p>
                </div>
              </div>
            </div>

            {/* PRINT Core Experience Chronology */}
            <div className="mb-5">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest border-b ${classicColors[theme].subborder} pb-0.5 mb-2 font-bold`}>
                Professional Experience Timeline
              </h3>
              
              <div className="space-y-4 font-sans text-xxs">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="print-break-inside-avoid">
                    <div className="flex items-start justify-between font-bold text-xxs">
                      <span className="text-[11px] font-bold">{exp.role.toUpperCase()} · {exp.company.toUpperCase()}</span>
                      <span className={`text-[10px] select-all font-semibold font-mono ${classicColors[theme].accentText}`}>{exp.period}</span>
                    </div>
                    <p className={`text-[10px] ${classicColors[theme].secondaryText} italic mb-1`}>{exp.location} ({exp.duration})</p>
                    <ul className={`list-inside space-y-0.5 text-xxs ${classicColors[theme].paragraphText} pl-1.5`}>
                      {exp.highlights.slice(0, 3).map((hl, i) => (
                        <li key={i} className="list-disc leading-normal pl-0.5 text-justify">{hl}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* PRINT Academic records */}
            <div className="print-break-inside-avoid">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest border-b ${classicColors[theme].subborder} pb-0.5 mb-1.5 font-bold`}>
                Academic Achievements
              </h3>
              <div className={`flex items-center justify-between text-xxs ${classicColors[theme].paragraphText} font-sans`}>
                <div>
                  <strong>Master of Computer Applications (MCA)</strong> · SRIT (Anna University)
                  <span className="block text-[10px] text-gray-400">Coimbatore · Graduated 2009</span>
                </div>
                <div className={`text-right font-extrabold border ${classicColors[theme].border} px-2.5 py-1 text-[10px] font-mono`}>
                   MCA SCORE: 75%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Informative Sandbox Browser Restriction Modal */}
      {showSandboxModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 animate-pulse" />
            
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Browser Sandbox Guide
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Optimized for Recruiters & Applicant Tracking Systems (ATS)
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Since you are currently previewing from inside the <strong>Google AI Studio Embedded Iframe Code Sandbox</strong>, standard browser download triggers and PDF print engines can be restricted.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs sm:text-sm text-slate-700 space-y-2.5 mb-6">
              <p className="font-semibold text-slate-900">To download or print files smoothly:</p>
              <div className="flex gap-2.5 leading-normal">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                <span>Click the <strong>"Open in New Tab"</strong> button in the top-right of your AI Studio preview frame (icon with box and upward diagonal arrow), or use the button below.</span>
              </div>
              <div className="flex gap-2.5 leading-normal">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                <span>Once the page opens in its own tab, click <strong>Download PDF</strong> or <strong>Download DOCX</strong> to save them flawlessly!</span>
              </div>
              <div className="flex gap-2.5 leading-normal border-t pt-2 border-slate-200/60 mt-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">✓</span>
                <div>
                  <span>If your browser allows, you can try to trigger a direct download now: </span>
                  <a
                    href={getDocxDownloadUrl()}
                    download="Sujitha_Manivasagam_Resume.docx"
                    className="underline font-bold text-blue-700 hover:text-blue-900 cursor-pointer whitespace-nowrap inline-flex items-center gap-0.5 ml-1"
                    onClick={() => setShowSandboxModal(false)}
                  >
                    Direct Download DOCX fallback ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedAppUrl(true);
                  setTimeout(() => setCopiedAppUrl(false), 2500);
                }}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200 flex-1"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{copiedAppUrl ? "Copied Link!" : "Copy Direct URL"}</span>
              </button>

              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowSandboxModal(false)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md flex-1 text-center"
              >
                <span>Launch in Standalone Tab</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close and continue
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
