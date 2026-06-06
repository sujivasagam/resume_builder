import { ResumeDocument } from "../types";

interface Props {
  resumes: ResumeDocument[];
  selectedResumeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ResumeManager({ resumes, selectedResumeId, onSelect, onCreate, onDuplicate, onDelete, onRename }: Props) {
  return (
    <section className="studio-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Resume Vault</p>
          <h2 className="section-title">Manage versions</h2>
        </div>
        <button className="primary-button" onClick={onCreate}>
          New Resume
        </button>
      </div>

      <div className="space-y-3">
        {resumes.map((resume) => {
          const isActive = resume.id === selectedResumeId;
          return (
            <button
              key={resume.id}
              className={`w-full rounded-3xl border p-4 text-left transition ${isActive ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300"}`}
              onClick={() => onSelect(resume.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{resume.name}</h3>
                  <p className={`mt-1 text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>{resume.targetRole}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {resume.templateId}
                </span>
              </div>
              <p className={`mt-3 text-xs ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                Updated {new Date(resume.lastUpdated).toLocaleDateString()}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`rounded-full px-3 py-1 text-xs ${isActive ? "bg-white/10" : "bg-slate-100"}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    const nextName = window.prompt("Rename resume", resume.name);
                    if (nextName?.trim()) {
                      onRename(resume.id, nextName.trim());
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  className={`rounded-full px-3 py-1 text-xs ${isActive ? "bg-white/10" : "bg-slate-100"}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDuplicate(resume.id);
                  }}
                >
                  Duplicate
                </button>
                <button
                  className={`rounded-full px-3 py-1 text-xs ${isActive ? "bg-red-500/15 text-red-100" : "bg-red-50 text-red-600"}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (resumes.length > 1) {
                      onDelete(resume.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
