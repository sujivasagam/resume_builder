/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ResumeData, TemplateId } from "../types";
import { loadResumeStore, saveResumeStore } from "../utils/storage";
import { resumeData as defaultResumeData } from "../resumeData";

interface ResumeState {
  resumes: ResumeData[];
  selectedResumeId: string;
  selectedTemplate: TemplateId;
  darkMode: boolean;
  initializeStore: () => void;
  addResume: (resume: ResumeData) => void;
  updateResume: (id: string, patch: Partial<ResumeData>) => void;
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => void;
  setSelectedResumeId: (id: string) => void;
  setSelectedTemplate: (templateId: TemplateId) => void;
  toggleDarkMode: () => void;
}

const createDefaultResume = (): ResumeData => ({
  ...defaultResumeData,
  id: "resume-1",
  templateId: "executive",
});

export const useResumeStore = create<ResumeState>()(
  devtools((set, get) => ({
    resumes: [createDefaultResume()],
    selectedResumeId: "resume-1",
    selectedTemplate: "executive",
    darkMode: false,
    initializeStore: () => {
      const stored = loadResumeStore();
      if (stored.length > 0) {
        set({ resumes: stored, selectedResumeId: stored[0].id });
      }
    },
    addResume: (resume) =>
      set((state) => {
        const next = [...state.resumes, resume];
        saveResumeStore(next);
        return { resumes: next, selectedResumeId: resume.id };
      }),
    updateResume: (id, patch) =>
      set((state) => {
        const next = state.resumes.map((resume) => (resume.id === id ? { ...resume, ...patch } : resume));
        saveResumeStore(next);
        return { resumes: next };
      }),
    deleteResume: (id) =>
      set((state) => {
        const next = state.resumes.filter((resume) => resume.id !== id);
        saveResumeStore(next);
        return { resumes: next, selectedResumeId: next[0]?.id ?? "" };
      }),
    duplicateResume: (id) =>
      set((state) => {
        const source = state.resumes.find((resume) => resume.id === id);
        if (!source) return state;
        const copy = { ...source, id: `${source.id}-copy-${Date.now()}`, headline: `${source.headline} (Copy)` };
        const next = [...state.resumes, copy];
        saveResumeStore(next);
        return { resumes: next, selectedResumeId: copy.id };
      }),
    setSelectedResumeId: (id) => set({ selectedResumeId: id }),
    setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  }))
);
