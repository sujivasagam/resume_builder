import { ResumeDocument, TemplateId } from "../types";

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildResume(name: string, targetRole: string, templateId: TemplateId, summary: string): ResumeDocument {
  const now = new Date().toISOString();

  return {
    id: makeId("resume"),
    name,
    targetRole,
    templateId,
    personal: {
      fullName: "Sujitha Manivasagam",
      title: targetRole,
      email: "sujitha29@gmail.com",
      phone: "+91 9943396016",
      location: "Coimbatore, India",
      linkedin: "linkedin.com/in/sujitha-manivasagam-6baa69358",
      github: "github.com/sujitha",
      portfolio: "sujitha.dev",
      summary,
    },
    skills: [
      "Technical Program Management",
      "Agile Delivery",
      "Stakeholder Management",
      "PHP",
      "Laravel",
      "MySQL",
      "Prompt Engineering",
      "AI-Assisted Delivery",
      "Roadmapping",
      "Release Planning",
      "Team Leadership",
      "Risk Mitigation",
    ],
    education: [
      {
        id: makeId("edu"),
        degree: "Master of Computer Applications",
        school: "Sri Ramakrishna Institute of Technology",
        period: "2006 - 2009",
        score: "75%",
      },
    ],
    experience: [
      {
        id: makeId("exp"),
        company: "BrainCert",
        role: "Project Manager",
        start: "2021",
        end: "Present",
        location: "Coimbatore, India",
        highlights: [
          "Led a 10+ member delivery team across product, engineering, QA, and design for a learning platform used at scale.",
          "Improved sprint throughput by 20-25% through backlog cleanup, risk tracking, and tighter release coordination.",
          "Aligned roadmap delivery with global stakeholders while preserving product quality and release stability.",
        ],
      },
      {
        id: makeId("exp"),
        company: "BrainCert",
        role: "Team Lead",
        start: "2019",
        end: "2020",
        location: "Coimbatore, India",
        highlights: [
          "Owned code quality reviews, database optimization, and onboarding support for PHP and MySQL teams.",
          "Supported architectural planning for LMS modules, integrations, and internal tooling.",
        ],
      },
    ],
    certifications: [
      {
        id: makeId("cert"),
        name: "Google Project Management Specialization",
        issuer: "Google",
        date: "2024",
        credentialId: "QHEJG8WJLSZL",
      },
      {
        id: makeId("cert"),
        name: "Generative AI for Project Managers",
        issuer: "IBM",
        date: "2026",
      },
    ],
    projects: [
      {
        id: makeId("proj"),
        name: "Unified Training Platform",
        url: "https://www.braincert.com",
        summary: "Managed releases and delivery for a SaaS training suite with virtual classroom, collaboration, and whiteboard experiences.",
        stack: ["PHP", "Joomla", "Slim", "MySQL"],
        outcomes: [
          "Improved release predictability across cross-functional teams.",
          "Supported scalable feature delivery for multi-tenant education clients.",
        ],
      },
      {
        id: makeId("proj"),
        name: "HCM Intranet Portal",
        summary: "Built workflow-heavy internal applications for timesheets, leave approvals, and performance reviews.",
        stack: ["Laravel", "MySQL", "jQuery"],
        outcomes: [
          "Streamlined approval workflows with clear system states.",
          "Reduced manual routing through automated process design.",
        ],
      },
    ],
    achievements: [
      "Improved delivery efficiency by 20-25% through process tuning and release discipline.",
      "Bridged technical architecture conversations with business delivery planning.",
    ],
    awards: ["Recognized internally for delivery leadership and mentoring support."],
    languages: ["English", "Tamil"],
    references: ["Available on request"],
    jobDescription: "",
    versionHistory: [
      {
        id: makeId("ver"),
        createdAt: now,
        label: "Initial profile",
      },
    ],
    lastUpdated: now,
  };
}

export function createSeedResumes(): ResumeDocument[] {
  return [
    buildResume(
      "Technical Project Manager",
      "Technical Project Manager",
      "executive",
      "Technical Project Manager with 15+ years spanning engineering delivery, PHP application architecture, Agile execution, and AI-aware operating models."
    ),
    buildResume(
      "AI Project Manager",
      "AI Project Manager",
      "interactive",
      "AI-focused project leader with 15+ years combining delivery governance, prompt engineering literacy, and deep technical credibility to move cross-functional programs faster."
    ),
    buildResume(
      "Engineering Manager",
      "Engineering Manager",
      "corporate",
      "Engineering manager profile grounded in 15+ years of technical depth, execution rigor, mentoring, and practical stakeholder alignment across product delivery."
    ),
  ];
}
