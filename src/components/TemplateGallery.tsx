import { TemplateCategory, TemplateId } from "../types";
import { templateCatalog } from "../templates/index";

interface Props {
  selectedTemplateId: TemplateId;
  searchQuery: string;
  category: TemplateCategory | "All";
  onSearch: (value: string) => void;
  onCategory: (value: TemplateCategory | "All") => void;
  onApply: (templateId: TemplateId) => void;
}

const categories: Array<TemplateCategory | "All"> = ["All", "Professional", "Executive", "ATS", "Creative", "Technical", "Project Management", "Interactive"];

export function TemplateGallery({ selectedTemplateId, searchQuery, category, onSearch, onCategory, onApply }: Props) {
  const filtered = templateCatalog.filter((template) => {
    const matchesCategory = category === "All" || template.category === category;
    const matchesSearch = `${template.name} ${template.description}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="studio-panel space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Template Gallery</p>
          <h2 className="section-title">Choose a real layout</h2>
        </div>
        <input
          className="input-field max-w-56"
          placeholder="Search templates"
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            className={`rounded-full px-4 py-2 text-sm ${item === category ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
            onClick={() => onCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((template) => {
          const active = template.id === selectedTemplateId;
          return (
            <button
              key={template.id}
              className={`group overflow-hidden rounded-[1.75rem] border text-left transition hover:-translate-y-1 ${active ? "border-slate-950 shadow-xl" : "border-slate-200 bg-white hover:border-slate-300"}`}
              onClick={() => onApply(template.id)}
            >
              <div className={`h-32 bg-gradient-to-br ${template.accent} p-5`}>
                <div className="grid h-full grid-cols-[0.8fr_1.2fr] gap-3 rounded-[1.2rem] bg-white/85 p-3 backdrop-blur">
                  <div className="rounded-2xl bg-slate-200/80" />
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 rounded-full bg-slate-400" />
                    <div className="h-2 w-full rounded-full bg-slate-300" />
                    <div className="h-2 w-5/6 rounded-full bg-slate-300" />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="h-10 rounded-xl bg-slate-200" />
                      <div className="h-10 rounded-xl bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{template.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs ${active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{template.description}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{template.fontFamily}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
