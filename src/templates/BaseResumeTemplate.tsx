import { ReactNode } from "react";
import { ResumeDocument } from "../types";

interface TemplateVariant {
  shell: string;
  header: string;
  sidebar?: string;
  heading: string;
  accent: string;
  body: string;
  section: string;
  font: string;
  layout: "single" | "split" | "hero";
}

interface Props {
  resume: ResumeDocument;
  variant: TemplateVariant;
}

function Section({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-current/20" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.35em]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function BaseResumeTemplate({ resume, variant }: Props) {
  const aside = (
    <aside className={`space-y-6 ${variant.sidebar ?? ""}`}>
      <Section title="Contact">
        <div className="space-y-2 text-sm">
          <p>{resume.personal.email}</p>
          <p>{resume.personal.phone}</p>
          <p>{resume.personal.location}</p>
          <p>{resume.personal.linkedin}</p>
          <p>{resume.personal.portfolio}</p>
        </div>
      </Section>
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {resume.skills.map((skill) => (
            <span key={skill} className={`rounded-full border px-3 py-1 text-xs ${variant.section}`}>
              {skill}
            </span>
          ))}
        </div>
      </Section>
      <Section title="Education">
        <div className="space-y-3">
          {resume.education.map((entry) => (
            <div key={entry.id}>
              <p className="font-semibold">{entry.degree}</p>
              <p className="text-sm opacity-80">{entry.school}</p>
              <p className="text-xs opacity-70">{entry.period}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Certifications">
        <div className="space-y-2 text-sm">
          {resume.certifications.map((entry) => (
            <p key={entry.id}>
              <span className="font-semibold">{entry.name}</span>
              <br />
              <span className="opacity-75">{entry.issuer}</span>
            </p>
          ))}
        </div>
      </Section>
    </aside>
  );

  const main = (
    <div className="space-y-8">
      <Section title="Professional Summary">
        <p className="text-sm leading-7 opacity-90">{resume.personal.summary}</p>
      </Section>
      <Section title="Experience">
        <div className="space-y-5">
          {resume.experience.map((entry) => (
            <article key={entry.id} className={`rounded-3xl border p-5 ${variant.section}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold">{entry.role}</h4>
                  <p className="text-sm opacity-80">{entry.company}</p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.2em] opacity-75">
                  <p>
                    {entry.start} - {entry.end}
                  </p>
                  <p>{entry.location}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 opacity-90">
                {entry.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className={variant.accent}>•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Projects">
        <div className="grid gap-4 md:grid-cols-2">
          {resume.projects.map((entry) => (
            <article key={entry.id} className={`rounded-3xl border p-5 ${variant.section}`}>
              <h4 className="text-base font-semibold">{entry.name}</h4>
              <p className="mt-2 text-sm leading-6 opacity-85">{entry.summary}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] opacity-70">{entry.stack.join(" • ")}</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );

  return (
    <div className={`${variant.shell} ${variant.font} overflow-hidden rounded-[2rem] border shadow-2xl`}>
      <div className={`${variant.header} p-10`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`mb-3 text-xs uppercase tracking-[0.45em] ${variant.accent}`}>{resume.targetRole}</p>
            <h1 className="text-4xl font-semibold tracking-tight">{resume.personal.fullName}</h1>
            <p className={`mt-3 max-w-2xl text-base ${variant.body}`}>{resume.personal.title}</p>
          </div>
          <div className={`rounded-full border px-5 py-2 text-xs uppercase tracking-[0.35em] ${variant.section}`}>
            {resume.name}
          </div>
        </div>
      </div>

      {variant.layout === "single" ? (
        <div className={`space-y-8 p-10 ${variant.heading}`}>
          {main}
          {aside}
        </div>
      ) : variant.layout === "hero" ? (
        <div className={`grid gap-8 p-10 lg:grid-cols-[1.25fr_0.75fr] ${variant.heading}`}>
          <div className="space-y-8">{main}</div>
          {aside}
        </div>
      ) : (
        <div className={`grid gap-8 p-10 lg:grid-cols-[0.72fr_1.28fr] ${variant.heading}`}>
          {aside}
          {main}
        </div>
      )}
    </div>
  );
}
