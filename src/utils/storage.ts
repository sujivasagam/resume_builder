import { StudioState } from "../types";

const STORAGE_KEY = "ai-resume-studio-pro-v2";

export function loadStudioState(): StudioState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StudioState;
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
