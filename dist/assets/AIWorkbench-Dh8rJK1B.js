import{r as i,j as e}from"./index-Bvb7IFVv.js";import{o as y,g,a as v}from"./gemini-Db1jMaq4.js";function f({resume:n,onApplySummary:d,onApplyTemplate:m}){const[s,a]=i.useState(null),[l,p]=i.useState(""),[o,u]=i.useState(""),[c,x]=i.useState([]),r=n.jobDescription,h=async()=>{a("optimize");try{const t=await y(n,r);p(`ATS Score: ${t.atsScore}
Keywords: ${t.keywordCoverage.join(", ")}
Missing: ${t.missingKeywords.join(", ")}

Enhanced Summary:
${t.enhancedSummary}

Improved bullets:
- ${t.improvedBullets.join(`
- `)}`),d(t.enhancedSummary),m(t.suggestedTemplateId)}finally{a(null)}},b=async()=>{a("cover");try{const t=await g(n,r);u(`${t.subjectLine}

${t.body}`)}finally{a(null)}},j=async()=>{a("variants");try{x(await v(n))}finally{a(null)}};return e.jsxs("section",{className:"studio-panel space-y-5",children:[e.jsxs("div",{children:[e.jsx("p",{className:"eyebrow",children:"Gemini Workbench"}),e.jsx("h2",{className:"section-title",children:"ATS, cover letter, and role variants"})]}),e.jsxs("label",{className:"field-block",children:["Job Description",e.jsx("textarea",{className:"input-field min-h-36",value:n.jobDescription,readOnly:!0})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx("button",{className:"primary-button",onClick:h,disabled:!r||!!s,children:s==="optimize"?"Optimizing...":"Optimize Resume"}),e.jsx("button",{className:"secondary-button",onClick:b,disabled:!r||!!s,children:s==="cover"?"Generating...":"Generate Cover Letter"}),e.jsx("button",{className:"secondary-button",onClick:j,disabled:!!s,children:s==="variants"?"Generating...":"Generate Resume Variants"})]}),l?e.jsx("pre",{className:"rounded-3xl bg-slate-950 p-5 text-sm text-slate-100 whitespace-pre-wrap",children:l}):null,o?e.jsx("pre",{className:"rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 whitespace-pre-wrap",children:o}):null,c.length?e.jsx("div",{className:"grid gap-3 md:grid-cols-2",children:c.map(t=>e.jsxs("article",{className:"rounded-3xl border border-slate-200 p-4",children:[e.jsx("h3",{className:"font-semibold",children:t.role}),e.jsx("p",{className:"mt-2 text-sm text-slate-600",children:t.headline}),e.jsx("p",{className:"mt-3 text-sm text-slate-500",children:t.summary})]},t.role))}):null]})}export{f as AIWorkbench};
