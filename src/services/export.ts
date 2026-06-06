import { Packer, Paragraph, TextRun, Document as WordDocument } from "docx";
import { ResumeDocument } from "../types";

declare global {
  interface Window {
    html2canvas?: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
    jspdf?: {
      jsPDF: new (options?: Record<string, unknown>) => {
        internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
        addImage: (...args: unknown[]) => void;
        addPage: () => void;
        save: (fileName: string) => void;
      };
    };
  }
}

async function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureCanvasExportDependencies() {
  if (!window.html2canvas) {
    await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
  }

  if (!window.jspdf?.jsPDF) {
    await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
  }
}

export async function exportResumeAsPdf(element: HTMLElement, fileName: string) {
  await ensureCanvasExportDependencies();

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error("PDF exporter failed to load.");
  }

  const canvas = await window.html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new window.jspdf.jsPDF({ unit: "px", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const ratio = canvas.width / width;
  const totalPages = Math.max(1, Math.ceil(canvas.height / (height * ratio)));

  for (let page = 0; page < totalPages; page += 1) {
    if (page > 0) {
      pdf.addPage();
    }

    pdf.addImage(imageData, "PNG", 0, -(page * height), width, canvas.height / ratio);
  }

  pdf.save(fileName);
}

export async function exportResumeAsPng(element: HTMLElement, fileName: string) {
  await ensureCanvasExportDependencies();

  if (!window.html2canvas) {
    throw new Error("PNG exporter failed to load.");
  }

  const canvas = await window.html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}

export async function exportResumeAsDocx(resume: ResumeDocument) {
  const doc = new WordDocument({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: resume.personal.fullName, bold: true, size: 32 }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: `${resume.personal.title} | ${resume.personal.email} | ${resume.personal.phone}` })],
          }),
          new Paragraph({ children: [new TextRun({ text: resume.personal.summary })] }),
          new Paragraph({ children: [new TextRun({ text: "Experience", bold: true })] }),
          ...resume.experience.flatMap((entry) => [
            new Paragraph({
              children: [new TextRun({ text: `${entry.role} - ${entry.company} (${entry.start} - ${entry.end})`, bold: true })],
            }),
            ...entry.highlights.map((highlight) => new Paragraph({ text: `• ${highlight}` })),
          ]),
          new Paragraph({ children: [new TextRun({ text: "Skills", bold: true })] }),
          new Paragraph({ text: resume.skills.join(" | ") }),
          new Paragraph({ children: [new TextRun({ text: "Education", bold: true })] }),
          ...resume.education.map((entry) => new Paragraph({ text: `${entry.degree} - ${entry.school} (${entry.period})` })),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${resume.name.replace(/\s+/g, "-").toLowerCase()}.docx`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportResumeAsDoc(resume: ResumeDocument) {
  const html = `
    <html>
      <body>
        <h1>${resume.personal.fullName}</h1>
        <p>${resume.personal.title}</p>
        <p>${resume.personal.email} | ${resume.personal.phone} | ${resume.personal.location}</p>
        <h2>Summary</h2>
        <p>${resume.personal.summary}</p>
        <h2>Experience</h2>
        ${resume.experience
          .map(
            (entry) => `
              <h3>${entry.role} - ${entry.company}</h3>
              <p>${entry.start} - ${entry.end} | ${entry.location}</p>
              <ul>${entry.highlights.map((item) => `<li>${item}</li>`).join("")}</ul>
            `
          )
          .join("")}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${resume.name.replace(/\s+/g, "-").toLowerCase()}.doc`;
  link.click();
  URL.revokeObjectURL(link.href);
}
