import { useEffect, useMemo, useState } from "react";
import { createSeedResumes } from "../data/defaultResume";
import { ResumeDocument, StudioState, TemplateId } from "../types";
import { loadStudioState, saveStudioState } from "../utils/storage";

function snapshot(label: string) {
  return {
    id: `ver-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    label,
  };
}

function createDefaultState(): StudioState {
  const resumes = createSeedResumes();
  return {
    resumes,
    selectedResumeId: resumes[0].id,
    searchQuery: "",
    settings: {
      darkMode: false,
      compactPreview: false,
    },
  };
}

export function useResumeStudio() {
  const [state, setState] = useState<StudioState>(() => loadStudioState() ?? createDefaultState());

  useEffect(() => {
    saveStudioState(state);
  }, [state]);

  const selectedResume = useMemo(
    () => state.resumes.find((resume) => resume.id === state.selectedResumeId) ?? state.resumes[0],
    [state.resumes, state.selectedResumeId]
  );

  const updateResume = (id: string, updater: (resume: ResumeDocument) => ResumeDocument, label = "Edited resume") => {
    setState((current) => ({
      ...current,
      resumes: current.resumes.map((resume) => {
        if (resume.id !== id) {
          return resume;
        }

        const next = updater(resume);
        return {
          ...next,
          lastUpdated: new Date().toISOString(),
          versionHistory: [snapshot(label), ...next.versionHistory].slice(0, 12),
        };
      }),
    }));
  };

  const renameResume = (id: string, name: string) => {
    updateResume(id, (resume) => ({ ...resume, name }), "Renamed resume");
  };

  const duplicateResume = (id: string) => {
    setState((current) => {
      const source = current.resumes.find((resume) => resume.id === id);
      if (!source) {
        return current;
      }

      const copyId = `resume-${Math.random().toString(36).slice(2, 9)}`;
      const copy: ResumeDocument = {
        ...source,
        id: copyId,
        name: `${source.name} Copy`,
        versionHistory: [snapshot("Duplicated resume"), ...source.versionHistory].slice(0, 12),
        lastUpdated: new Date().toISOString(),
      };

      return {
        ...current,
        resumes: [copy, ...current.resumes],
        selectedResumeId: copyId,
      };
    });
  };

  const deleteResume = (id: string) => {
    setState((current) => {
      const resumes = current.resumes.filter((resume) => resume.id !== id);
      const fallback = resumes[0]?.id ?? "";
      return {
        ...current,
        resumes,
        selectedResumeId: current.selectedResumeId === id ? fallback : current.selectedResumeId,
      };
    });
  };

  const createResume = () => {
    const fresh = createSeedResumes()[0];
    const resume: ResumeDocument = {
      ...fresh,
      id: `resume-${Math.random().toString(36).slice(2, 9)}`,
      name: "New Resume",
      targetRole: "Target Role",
      versionHistory: [snapshot("Created resume")],
      lastUpdated: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      resumes: [resume, ...current.resumes],
      selectedResumeId: resume.id,
    }));
  };

  const applyTemplate = (id: string, templateId: TemplateId) => {
    updateResume(id, (resume) => ({ ...resume, templateId }), `Applied ${templateId} template`);
  };

  const setSearchQuery = (searchQuery: string) => {
    setState((current) => ({ ...current, searchQuery }));
  };

  const toggleDarkMode = () => {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, darkMode: !current.settings.darkMode },
    }));
  };

  const toggleCompactPreview = () => {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, compactPreview: !current.settings.compactPreview },
    }));
  };

  return {
    state,
    selectedResume,
    setSelectedResumeId: (selectedResumeId: string) => setState((current) => ({ ...current, selectedResumeId })),
    updateResume,
    renameResume,
    duplicateResume,
    deleteResume,
    createResume,
    applyTemplate,
    setSearchQuery,
    toggleDarkMode,
    toggleCompactPreview,
  };
}
