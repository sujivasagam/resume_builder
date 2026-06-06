/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ResumeData } from "../types";

const STORAGE_KEY = "ai-resume-studio-resumes-v1";

export function loadResumeStore(): ResumeData[] {
  if (typeof window === "undefined") return [];

  try {
    const payload = window.localStorage.getItem(STORAGE_KEY);
    if (!payload) return [];
    const resumes = JSON.parse(payload) as ResumeData[];
    return Array.isArray(resumes) ? resumes : [];
  } catch (error) {
    console.warn("Failed to load resume store", error);
    return [];
  }
}

export function saveResumeStore(resumes: ResumeData[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch (error) {
    console.warn("Failed to save resume store", error);
  }
}
