import { ResumeDocument } from "../types";

const navItems = [
  { id: "interactive-summary", label: "Summary" },
  { id: "interactive-experience", label: "Experience" },
  { id: "interactive-projects", label: "Projects" },
  { id: "interactive-skills", label: "Skills" },
  { id: "interactive-education", label: "Education" },
  { id: "interactive-certifications", label: "Certifications" },
];

export function InteractiveResume({ resume }: { resume: ResumeDocument }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-slate-950 shadow-2xl">
      <div className="bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#38bdf8)] p-10 text-white">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.45em] text-cyan-200">Interactive Resume</p>
            <h1 className="text-4xl font-semibold tracking-tight">{resume.personal.fullName}</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-200">{resume.personal.title}</p>
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.35em]">
            {resume.name}
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-white/20"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid gap-8 p-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <section id="interactive-summary" className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Summary</h3>
            <p className="mt-4 text-sm leading-7 text-slate-700">{resume.personal.summary}</p>
          </section>

          <section id="interactive-experience" className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Experience</h3>
            <div className="mt-5 space-y-5">
              {resume.experience.map((entry) => (
                <article key={entry.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold">{entry.role}</h4>
                      <p className="text-sm text-slate-600">{entry.company}</p>
                    </div>
                    <div className="text-right text-xs uppercase tracking-[0.2em] text-slate-500">
                      <p>
                        {entry.start} - {entry.end}
                      </p>
                      <p>{entry.location}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="text-cyan-600">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="interactive-projects" className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Projects</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {resume.projects.map((entry) => (
                <article key={entry.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-5">
                  <h4 className="text-base font-semibold">{entry.name}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{entry.summary}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{entry.stack.join(" • ")}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="interactive-certifications" className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Certifications</h3>
            <div className="mt-5 grid gap-4">
              {resume.certifications.map((entry) => (
                <article key={entry.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-5">
                  <h4 className="text-base font-semibold">{entry.name}</h4>
                  <p className="mt-2 text-sm text-slate-600">{entry.issuer}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {entry.date}{entry.credentialId ? ` • ${entry.credentialId}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section id="interactive-skills" className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-[#0f172a] p-6 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section id="interactive-education" className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Education</h3>
            <div className="mt-4 space-y-4">
              {resume.education.map((entry) => (
                <div key={entry.id}>
                  <p className="font-semibold text-slate-900">{entry.degree}</p>
                  <p className="text-sm text-slate-600">{entry.school}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{entry.period}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Contact</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>{resume.personal.email}</p>
              <p>{resume.personal.phone}</p>
              <p>{resume.personal.location}</p>
              <p>{resume.personal.linkedin}</p>
              <p>{resume.personal.portfolio}</p>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Achievements</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {resume.achievements.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-cyan-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Languages</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {resume.languages.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
