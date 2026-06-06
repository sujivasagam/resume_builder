/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ResumeContact {
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location?: string;
  summary: string;
  accomplishments: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  url?: string;
  techStack: string[];
  description: string;
  achievements: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  university?: string;
  period: string;
  score?: string;
}

export interface ResumeCertification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface ResumeReference {
  id: string;
  name: string;
  relationship: string;
  company?: string;
  contact?: string;
}

export interface ResumeData {
  id: string;
  name: string;
  headline: string;
  summary: string;
  contact: ResumeContact;
  skills: string[];
  technicalSkills?: string[];
  managementSkills?: string[];
  certifications: ResumeCertification[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  achievements?: string[];
  awards?: string[];
  languages?: string[];
  references?: ResumeReference[];
  templateId: string;
}

export type TemplateId =
  | "executive"
  | "modern"
  | "minimalist"
  | "sidebar"
  | "corporate"
  | "elegant"
  | "portfolio"
  | "ats"
  | "creative"
  | "technical";
