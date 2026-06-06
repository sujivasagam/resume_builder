import { ResumeDocument } from "../types";

interface Props {
  resume: ResumeDocument;
  onChange: (resume: ResumeDocument) => void;
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ResumeEditor({ resume, onChange }: Props) {
  return (
    <section className="studio-panel space-y-6">
      <div>
        <p className="eyebrow">Builder</p>
        <h2 className="section-title">Manual entry and editing</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-block">
          Resume Name
          <input className="input-field" value={resume.name} onChange={(event) => onChange({ ...resume, name: event.target.value })} />
        </label>
        <label className="field-block">
          Target Role
          <input className="input-field" value={resume.targetRole} onChange={(event) => onChange({ ...resume, targetRole: event.target.value, personal: { ...resume.personal, title: event.target.value } })} />
        </label>
        <label className="field-block">
          Full Name
          <input className="input-field" value={resume.personal.fullName} onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, fullName: event.target.value } })} />
        </label>
        <label className="field-block">
          Email
          <input className="input-field" value={resume.personal.email} onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, email: event.target.value } })} />
        </label>
        <label className="field-block">
          Phone
          <input className="input-field" value={resume.personal.phone} onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, phone: event.target.value } })} />
        </label>
        <label className="field-block">
          Location
          <input className="input-field" value={resume.personal.location} onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, location: event.target.value } })} />
        </label>
        <label className="field-block">
          LinkedIn
          <input className="input-field" value={resume.personal.linkedin} onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, linkedin: event.target.value } })} />
        </label>
        <label className="field-block">
          Portfolio
          <input className="input-field" value={resume.personal.portfolio} onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, portfolio: event.target.value } })} />
        </label>
      </div>

      <label className="field-block">
        Professional Summary
        <textarea
          className="input-field min-h-32"
          value={resume.personal.summary}
          onChange={(event) => onChange({ ...resume, personal: { ...resume.personal, summary: event.target.value } })}
        />
      </label>

      <label className="field-block">
        Skills
        <textarea
          className="input-field min-h-24"
          value={resume.skills.join(", ")}
          onChange={(event) => onChange({ ...resume, skills: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
        />
      </label>

      <label className="field-block">
        Achievements
        <textarea
          className="input-field min-h-24"
          value={resume.achievements.join("\n")}
          onChange={(event) => onChange({ ...resume, achievements: linesToArray(event.target.value) })}
        />
      </label>

      <label className="field-block">
        Languages
        <textarea
          className="input-field min-h-20"
          value={resume.languages.join(", ")}
          onChange={(event) => onChange({ ...resume, languages: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
        />
      </label>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Experience</h3>
        {resume.experience.map((entry) => (
          <div key={entry.id} className="rounded-3xl border border-slate-200 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-block">
                Role
                <input className="input-field" value={entry.role} onChange={(event) => onChange({ ...resume, experience: resume.experience.map((item) => item.id === entry.id ? { ...item, role: event.target.value } : item) })} />
              </label>
              <label className="field-block">
                Company
                <input className="input-field" value={entry.company} onChange={(event) => onChange({ ...resume, experience: resume.experience.map((item) => item.id === entry.id ? { ...item, company: event.target.value } : item) })} />
              </label>
            </div>
            <label className="field-block mt-4">
              Highlights
              <textarea
                className="input-field min-h-24"
                value={entry.highlights.join("\n")}
                onChange={(event) => onChange({ ...resume, experience: resume.experience.map((item) => item.id === entry.id ? { ...item, highlights: linesToArray(event.target.value) } : item) })}
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
