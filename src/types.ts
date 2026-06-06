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

export type TemplateCategory =
  | "Professional"
  | "Executive"
  | "ATS"
  | "Creative"
  | "Technical"
  | "Project Management";

export interface PersonalDetails {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  highlights: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  period: string;
  score?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  url?: string;
  summary: string;
  stack: string[];
  outcomes: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface VersionSnapshot {
  id: string;
  createdAt: string;
  label: string;
}

export interface ResumeDocument {
  id: string;
  name: string;
  targetRole: string;
  templateId: TemplateId;
  personal: PersonalDetails;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  achievements: string[];
  awards: string[];
  languages: string[];
  references: string[];
  jobDescription: string;
  versionHistory: VersionSnapshot[];
  lastUpdated: string;
}

export interface StudioSettings {
  darkMode: boolean;
  compactPreview: boolean;
}

export interface StudioState {
  resumes: ResumeDocument[];
  selectedResumeId: string;
  searchQuery: string;
  settings: StudioSettings;
}

export interface AiOptimizationResult {
  atsScore: number;
  keywordCoverage: string[];
  missingKeywords: string[];
  enhancedSummary: string;
  improvedBullets: string[];
  suggestedTemplateId: TemplateId;
}

export interface CoverLetterResult {
  subjectLine: string;
  body: string;
}

export interface ResumeVariantResult {
  role: string;
  headline: string;
  summary: string;
}

export interface ScreenshotTemplateResult {
  templateId: TemplateId;
  rationale: string[];
  palette: string[];
  typography: string[];
}

export interface ImportAnalysisResult {
  detectedSections: string[];
  extractedHighlights: string[];
  parsingNotes: string[];
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: TemplateCategory;
  description: string;
  accent: string;
  fontFamily: string;
}
