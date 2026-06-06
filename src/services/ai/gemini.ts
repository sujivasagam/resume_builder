/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TailorResult {
  score: number;
  strengths: string[];
  gaps: string[];
  tailoredHeadline: string;
  tailoredSummary: string;
  highlightedProjects: Array<{ projectId: string; projectName: string; matchingAngle: string }>;
  coverLetter: string;
  interviewPrep: string[];
}

export async function tailorResume(jobDescription: string, focus: string): Promise<TailorResult> {
  const response = await fetch("/api/tailor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jobDescription, focus }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Resume tailoring failed");
  }

  return response.json();
}

export async function parseResumeFromText(text: string): Promise<Record<string, unknown>> {
  // Placeholder for future extraction endpoints.
  return { parsed: true, extractedText: text.slice(0, 200) };
}
