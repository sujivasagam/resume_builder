import { StudioState } from "../types";

const STORAGE_KEY = "ai-resume-studio-pro-v2";

function normalizeSummary(summary: string) {
  return summary
    .replace("13+ years", "15+ years")
    .replace("13+ Years", "15+ Years");
}

function normalizeStudioState(state: StudioState): StudioState {
  return {
    ...state,
    resumes: state.resumes.map((resume) => ({
      ...resume,
      personal: {
        ...resume.personal,
        summary: normalizeSummary(resume.personal.summary),
      },
    })),
  };
}

export function loadStudioState(): StudioState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizeStudioState(JSON.parse(raw) as StudioState);
  } catch (error) {
    console.warn("Failed to load studio state", error);
    return null;
  }
}

export function saveStudioState(state: StudioState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save studio state", error);
  }
}
