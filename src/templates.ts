/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JobTemplate {
  title: string;
  focus: string;
  company: string;
  description: string;
}

export const jobTemplates: JobTemplate[] = [
  {
    title: "Senior Technical Project Manager (SaaS Platforms)",
    focus: "pm",
    company: "EdTech Innovators Corp.",
    description: `We are seeking a Senior Technical Project Manager to lead the delivery of our next-generation web-based learning platform. 

Responsibilities:
- Spearhead end-to-end SDLC using Scrum/Agile frameworks for cross-functional teams of 10+ engineers and product designers.
- Collaborate with executive leadership and international stakeholders to govern delivery timelines, manage risks, and ensure high-quality software releases.
- Improve delivery throughput and team velocity by optimizing sprint planners and removing code-quality obstacles.
- Lead system requirements decomposition, architectural alignment, and release management.

Qualifications:
- 10+ years of background in software delivery, ideally starting as a software engineer/developer before moving to PM.
- Experience with web applications, unified communication interfaces, high concurrency video/audio components, or multi-tenant architectures.
- Outstanding milestone-tracking, risk management, and Agile project governance credentials.`
  },
  {
    title: "Full-Stack PHP Developer & Backend Architect",
    focus: "tech",
    company: "CommerceOne Solutions",
    description: `We are looking for a Senior Hands-on Developer who can contribute to both coding and team leadership.

Key Requirements:
- Deep specialized knowledge of PHP development, including frameworks like Laravel or CodeIgniter, Slim PHP, and MySQL database engines.
- Proven experience optimizing sluggish SQL queries, database indexing, and designing complex entity-relationship models.
- Willingness to establish standard code-review protocols, mentor junior/mid-level developer staff, and safeguard backend architectures against security flaws (SQL injection, XSS).
- Familiarity integrated payment getaways (Axis, Stripe), delivery tracking webhooks, API wrappers, and CMS configurations.
- Experience directing deployment processes, timeline schedules, and basic ticket triages is an benefit.`
  },
  {
    title: "AI-Aware Scrum Master & Engineering Lead",
    focus: "ai",
    company: "Antigravity Engineering Ltd",
    description: `We are searching for an innovative, AI-Aware Scrum Master and Delivery Lead to oversee high-impact automation projects.

Attributes:
- Expertise facilitating Agile teams, Scrum ceremonies, and driving focus while managing technical project lifecycles.
- High familiarity with Generative AI workflows, prompt engineering techniques, and utilizing AI capabilities to enhance team efficiency and app capabilities.
- Proven background managing stakeholder communications, mitigating high-risk delivery bottlenecks, and driving team-wide alignment.
- A strong technical foundation in web-based products, content management systems, and third-party integrations.`
  }
];
