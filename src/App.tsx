import { Suspense, lazy, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ResumeManager } from "./components/ResumeManager";
import { useResumeStudio } from "./store/useResumeStore";
import { TemplateCategory } from "./types";

const AIWorkbench = lazy(() => import("./components/AIWorkbench").then((module) => ({ default: module.AIWorkbench })));
const ExportCenter = lazy(() => import("./components/ExportCenter").then((module) => ({ default: module.ExportCenter })));
const ImportCenter = lazy(() => import("./components/ImportCenter").then((module) => ({ default: module.ImportCenter })));
const ResumeEditor = lazy(() => import("./components/ResumeEditor").then((module) => ({ default: module.ResumeEditor })));
const ResumePreview = lazy(() => import("./components/ResumePreview").then((module) => ({ default: module.ResumePreview })));
const TemplateGallery = lazy(() => import("./components/TemplateGallery").then((module) => ({ default: module.TemplateGallery })));

type View = "dashboard" | "builder" | "templates" | "ai" | "export" | "settings";

export default function App() {
  const studio = useResumeStudio();
  const resume = studio.selectedResume;
  const [view, setView] = useState<View>("dashboard");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory | "All">("All");

  const filteredCount = useMemo(
    () => studio.state.resumes.filter((item) => item.name.toLowerCase().includes(studio.state.searchQuery.toLowerCase())).length,
    [studio.state.resumes, studio.state.searchQuery]
  );

  if (!resume) {
    return null;
  }

  return (
    <div className={studio.state.settings.darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_30%),linear-gradient(180deg,#f8fafc,white_50%,#f1f5f9)] text-slate-950 dark:bg-[radial-gradient(circle_at_top,#0f172a,transparent_25%),linear-gradient(180deg,#020617,#0f172a_55%,#111827)] dark:text-slate-100">
        <header className="border-b border-white/50 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 lg:px-8">
            <div>
              <p className="eyebrow">AI Resume Studio Pro</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Browser-first resume builder with AI, templates, and exact exports</h1>
            </div>
            <div className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {(["dashboard", "builder", "templates", "ai", "export", "settings"] as View[]).map((item) => (
                <button
                  key={item}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm capitalize ${view === item ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}
                  onClick={() => setView(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
          <div className="space-y-6">
            <ResumeManager
              resumes={studio.state.resumes}
              selectedResumeId={studio.state.selectedResumeId}
              onSelect={studio.setSelectedResumeId}
              onCreate={studio.createResume}
              onDuplicate={studio.duplicateResume}
              onDelete={studio.deleteResume}
              onRename={studio.renameResume}
            />

            <div className="studio-panel space-y-4">
              <div>
                <p className="eyebrow">Studio Snapshot</p>
                <h2 className="section-title">Current workspace</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="metric-card">
                  <span className="metric-label">Resumes</span>
                  <strong className="metric-value">{studio.state.resumes.length}</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Matches</span>
                  <strong className="metric-value">{filteredCount}</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Versions</span>
                  <strong className="metric-value">{resume.versionHistory.length}</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Template</span>
                  <strong className="metric-value">{resume.templateId}</strong>
                </div>
              </div>
              <input
                className="input-field"
                placeholder="Search resumes"
                value={studio.state.searchQuery}
                onChange={(event) => studio.setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <Suspense fallback={<section className="studio-panel">Loading studio view...</section>}>
                {view === "dashboard" ? (
                  <>
                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                      <ImportCenter
                        jobDescription={resume.jobDescription}
                        onJobDescriptionChange={(jobDescription) =>
                          studio.updateResume(resume.id, (current) => ({ ...current, jobDescription }), "Updated job description")
                        }
                        onTemplateSuggestion={(templateId) => studio.applyTemplate(resume.id, templateId)}
                      />
                      <ResumePreview resume={resume} compact={studio.state.settings.compactPreview} />
                    </div>
                    <TemplateGallery
                      selectedTemplateId={resume.templateId}
                      searchQuery={studio.state.searchQuery}
                      category={templateCategory}
                      onSearch={studio.setSearchQuery}
                      onCategory={setTemplateCategory}
                      onApply={(templateId) => studio.applyTemplate(resume.id, templateId)}
                    />
                  </>
                ) : null}

                {view === "builder" ? (
                  <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <ResumeEditor
                      resume={resume}
                      onChange={(nextResume) => studio.updateResume(resume.id, () => nextResume, "Edited resume details")}
                    />
                    <ResumePreview resume={resume} compact={studio.state.settings.compactPreview} />
                  </div>
                ) : null}

                {view === "templates" ? (
                  <>
                    <TemplateGallery
                      selectedTemplateId={resume.templateId}
                      searchQuery={studio.state.searchQuery}
                      category={templateCategory}
                      onSearch={studio.setSearchQuery}
                      onCategory={setTemplateCategory}
                      onApply={(templateId) => studio.applyTemplate(resume.id, templateId)}
                    />
                    <ResumePreview resume={resume} compact={false} />
                  </>
                ) : null}

                {view === "ai" ? (
                  <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <AIWorkbench
                      resume={resume}
                      onApplySummary={(summary) =>
                        studio.updateResume(
                          resume.id,
                          (current) => ({ ...current, personal: { ...current.personal, summary } }),
                          "Applied AI summary"
                        )
                      }
                      onApplyTemplate={(templateId) => studio.applyTemplate(resume.id, templateId)}
                    />
                    <ResumePreview resume={resume} compact={studio.state.settings.compactPreview} />
                  </div>
                ) : null}

                {view === "export" ? (
                  <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                    <ExportCenter resume={resume} />
                    <ResumePreview resume={resume} compact={false} />
                  </div>
                ) : null}

                {view === "settings" ? (
                  <section className="studio-panel space-y-5">
                    <div>
                      <p className="eyebrow">Settings</p>
                      <h2 className="section-title">Presentation and deployment switches</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <button className="secondary-button justify-center" onClick={studio.toggleDarkMode}>
                        {studio.state.settings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                      </button>
                      <button className="secondary-button justify-center" onClick={studio.toggleCompactPreview}>
                        {studio.state.settings.compactPreview ? "Use Full Preview" : "Use Compact Preview"}
                      </button>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      Netlify-ready serverless AI is routed through <code>/api/tailor</code>. Use <code>VITE_GEMINI_API_KEY</code> for browser-connected environments and <code>GEMINI_API_KEY</code> for server-side Netlify functions.
                    </div>
                  </section>
                ) : null}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
