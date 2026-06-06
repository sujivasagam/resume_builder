import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  AlignmentType,
  Bookmark,
  BorderStyle,
  ExternalHyperlink,
  HeadingLevel,
  InternalHyperlink,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  Document as WordDocument,
  WidthType,
} from "docx";
import { ResumeDocument } from "../types";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function sanitizeFileName(name: string, extension: string) {
  return `${name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "resume"}.${extension}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getThemeTokens(templateId: ResumeDocument["templateId"]) {
  switch (templateId) {
    case "interactive":
      return {
        accent: "#0f62fe",
        accentSoft: "#e0ecff",
        heading: "#0f172a",
        text: "#334155",
        background: "#ffffff",
        panel: "#f8fafc",
      };
    case "technical":
      return {
        accent: "#10b981",
        accentSoft: "#ecfdf5",
        heading: "#0f172a",
        text: "#334155",
        background: "#ffffff",
        panel: "#f8fafc",
      };
    case "creative":
      return {
        accent: "#7c3aed",
        accentSoft: "#f3e8ff",
        heading: "#172033",
        text: "#475569",
        background: "#fffdf7",
        panel: "#ffffff",
      };
    default:
      return {
        accent: "#1d4ed8",
        accentSoft: "#dbeafe",
        heading: "#0f172a",
        text: "#475569",
        background: "#ffffff",
        panel: "#f8fafc",
      };
  }
}

export async function exportResumeAsPdf(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: Math.max(element.scrollWidth, 1200),
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const targetWidth = pageWidth - margin * 2;
  const scale = targetWidth / canvas.width;
  const pageCanvasHeight = Math.floor((pageHeight - margin * 2) / scale);
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const sliceCanvas = document.createElement("canvas");
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - pageIndex * pageCanvasHeight);
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;

    const context = sliceCanvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create PDF page context.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    context.drawImage(
      canvas,
      0,
      pageIndex * pageCanvasHeight,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    if (pageIndex > 0) {
      pdf.addPage();
    }

    const imageData = sliceCanvas.toDataURL("image/png");
    const renderedHeight = sliceHeight * scale;
    pdf.addImage(imageData, "PNG", margin, margin, targetWidth, renderedHeight, undefined, "FAST");
  }

  pdf.save(fileName);
}

export async function exportResumeAsPng(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: Math.max(element.scrollWidth, 1200),
  });

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    throw new Error("Unable to generate PNG.");
  }
  downloadBlob(blob, fileName);
}

function bookmarkParagraph(id: string, text: string, tokens: ReturnType<typeof getThemeTokens>, level: keyof typeof HeadingLevel = "HEADING_1") {
  return new Paragraph({
    heading: HeadingLevel[level],
    spacing: { before: 280, after: 120 },
    children: [
      new Bookmark({
        id,
        children: [
          new TextRun({
            text,
            bold: true,
            color: tokens.heading.replace("#", ""),
          }),
        ],
      }),
    ],
  });
}

function navCell(label: string, anchor: string, tokens: ReturnType<typeof getThemeTokens>) {
  return new TableCell({
    width: { size: 20, type: WidthType.PERCENTAGE },
    shading: { fill: tokens.accentSoft.replace("#", ""), type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new InternalHyperlink({
            anchor,
            children: [
              new TextRun({
                text: label,
                bold: true,
                color: tokens.accent.replace("#", ""),
                underline: { type: UnderlineType.SINGLE, color: tokens.accent.replace("#", "") },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function exportResumeAsDocx(resume: ResumeDocument) {
  const tokens = getThemeTokens(resume.templateId);

  const doc = new WordDocument({
    sections: [
      {
        children: [
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: resume.personal.fullName, bold: true, size: 34, color: tokens.heading.replace("#", "") })],
          }),
          new Paragraph({
            spacing: { after: 220 },
            children: [new TextRun({ text: resume.personal.title, color: tokens.accent.replace("#", ""), bold: true, size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({ text: `${resume.personal.email} | ${resume.personal.phone} | ${resume.personal.location}`, color: tokens.text.replace("#", "") }),
            ],
          }),
          new Paragraph({
            spacing: { after: 260 },
            children: [
              new ExternalHyperlink({
                link: `https://${resume.personal.linkedin.replace(/^https?:\/\//, "")}`,
                children: [new TextRun({ text: resume.personal.linkedin, style: "Hyperlink" })],
              }),
              new TextRun({ text: "   " }),
              new ExternalHyperlink({
                link: `https://${resume.personal.portfolio.replace(/^https?:\/\//, "")}`,
                children: [new TextRun({ text: resume.personal.portfolio, style: "Hyperlink" })],
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  navCell("Summary", "summary", tokens),
                  navCell("Experience", "experience", tokens),
                  navCell("Projects", "projects", tokens),
                  navCell("Skills", "skills", tokens),
                  navCell("Education", "education", tokens),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
          }),
          bookmarkParagraph("summary", "Professional Summary", tokens),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: resume.personal.summary, color: tokens.text.replace("#", ""), size: 22 })],
          }),
          bookmarkParagraph("experience", "Experience", tokens),
          ...resume.experience.flatMap((entry) => [
            new Paragraph({
              spacing: { before: 100, after: 60 },
              children: [
                new TextRun({ text: `${entry.role} | ${entry.company}`, bold: true, color: tokens.heading.replace("#", ""), size: 24 }),
              ],
            }),
            new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: `${entry.start} - ${entry.end} | ${entry.location}`, italics: true, color: tokens.accent.replace("#", "") })],
            }),
            ...entry.highlights.map(
              (highlight) =>
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                  children: [new TextRun({ text: highlight, color: tokens.text.replace("#", "") })],
                })
            ),
          ]),
          bookmarkParagraph("projects", "Projects", tokens),
          ...resume.projects.flatMap((entry) => [
            new Paragraph({
              spacing: { before: 100, after: 60 },
              children: [new TextRun({ text: entry.name, bold: true, color: tokens.heading.replace("#", ""), size: 24 })],
            }),
            new Paragraph({
              spacing: { after: 60 },
              children: [new TextRun({ text: entry.summary, color: tokens.text.replace("#", "") })],
            }),
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: entry.stack.join(" | "), color: tokens.accent.replace("#", ""), italics: true })],
            }),
          ]),
          bookmarkParagraph("skills", "Skills", tokens),
          new Paragraph({
            spacing: { after: 180 },
            children: [new TextRun({ text: resume.skills.join("  |  "), color: tokens.text.replace("#", "") })],
          }),
          bookmarkParagraph("education", "Education", tokens),
          ...resume.education.map(
            (entry) =>
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: `${entry.degree} | ${entry.school}`, bold: true, color: tokens.heading.replace("#", "") }),
                  new TextRun({ text: `\n${entry.period}${entry.score ? ` | ${entry.score}` : ""}`, color: tokens.text.replace("#", "") }),
                ],
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, sanitizeFileName(resume.name, "docx"));
}

function buildDocHtml(resume: ResumeDocument) {
  const tokens = getThemeTokens(resume.templateId);

  const skillTags = resume.skills
    .map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`)
    .join("");

  const projectCards = resume.projects
    .map(
      (entry) => `
        <div class="card">
          <h3>${escapeHtml(entry.name)}</h3>
          <p>${escapeHtml(entry.summary)}</p>
          <div class="meta">${escapeHtml(entry.stack.join(" • "))}</div>
        </div>
      `
    )
    .join("");

  const experienceItems = resume.experience
    .map(
      (entry) => `
        <div class="card">
          <div class="row">
            <div>
              <h3>${escapeHtml(entry.role)}</h3>
              <div class="sub">${escapeHtml(entry.company)}</div>
            </div>
            <div class="meta">${escapeHtml(`${entry.start} - ${entry.end}`)}<br/>${escapeHtml(entry.location)}</div>
          </div>
          <ul>${entry.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      `
    )
    .join("");

  const educationItems = resume.education
    .map(
      (entry) => `
        <div class="card">
          <h3>${escapeHtml(entry.degree)}</h3>
          <div class="sub">${escapeHtml(entry.school)}</div>
          <div class="meta">${escapeHtml(entry.period)}${entry.score ? ` | ${escapeHtml(entry.score)}` : ""}</div>
        </div>
      `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(resume.name)}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: ${tokens.text}; background: ${tokens.background}; }
          .shell { max-width: 900px; margin: 0 auto; padding: 24px; }
          .hero { background: linear-gradient(135deg, ${tokens.heading}, ${tokens.accent}); color: white; padding: 28px; border-radius: 24px; }
          .eyebrow { text-transform: uppercase; letter-spacing: 0.28em; font-size: 11px; color: #cbd5e1; }
          h1 { margin: 10px 0 0; font-size: 34px; }
          .title { margin-top: 12px; font-size: 18px; color: #e2e8f0; }
          .contact { margin-top: 18px; font-size: 13px; line-height: 1.7; }
          .nav { margin-top: 20px; }
          .nav a { display: inline-block; margin: 0 8px 8px 0; padding: 8px 14px; background: rgba(255,255,255,0.14); color: white; text-decoration: none; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; }
          .section { margin-top: 20px; padding: 22px; background: ${tokens.panel}; border: 1px solid #e2e8f0; border-radius: 20px; }
          .section h2 { margin: 0 0 14px; color: ${tokens.heading}; font-size: 18px; text-transform: uppercase; letter-spacing: 0.18em; }
          .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px; margin-top: 20px; }
          .stack { display: grid; gap: 16px; }
          .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
          .card h3 { margin: 0; font-size: 17px; color: ${tokens.heading}; }
          .sub { margin-top: 4px; color: ${tokens.text}; font-size: 14px; }
          .meta { margin-top: 8px; color: ${tokens.accent}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
          ul { margin: 12px 0 0 18px; padding: 0; }
          li { margin-bottom: 8px; line-height: 1.5; }
          .chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .chip { display: inline-block; padding: 8px 12px; border-radius: 999px; background: ${tokens.accentSoft}; color: ${tokens.accent}; font-size: 12px; font-weight: bold; }
          .links a { color: ${tokens.accent}; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="hero">
            <div class="eyebrow">${escapeHtml(resume.templateId)} template</div>
            <h1>${escapeHtml(resume.personal.fullName)}</h1>
            <div class="title">${escapeHtml(resume.personal.title)}</div>
            <div class="contact">${escapeHtml(resume.personal.email)} | ${escapeHtml(resume.personal.phone)} | ${escapeHtml(resume.personal.location)}</div>
            <div class="contact links"><a href="https://${escapeHtml(resume.personal.linkedin.replace(/^https?:\/\//, ""))}">${escapeHtml(resume.personal.linkedin)}</a> | <a href="https://${escapeHtml(resume.personal.portfolio.replace(/^https?:\/\//, ""))}">${escapeHtml(resume.personal.portfolio)}</a></div>
            <div class="nav">
              <a href="#summary">Summary</a>
              <a href="#experience">Experience</a>
              <a href="#projects">Projects</a>
              <a href="#skills">Skills</a>
              <a href="#education">Education</a>
            </div>
          </div>
          <div class="grid">
            <div class="stack">
              <div class="section" id="summary">
                <h2>Summary</h2>
                <p>${escapeHtml(resume.personal.summary)}</p>
              </div>
              <div class="section" id="experience">
                <h2>Experience</h2>
                ${experienceItems}
              </div>
              <div class="section" id="projects">
                <h2>Projects</h2>
                ${projectCards}
              </div>
            </div>
            <div class="stack">
              <div class="section" id="skills">
                <h2>Skills</h2>
                <div class="chips">${skillTags}</div>
              </div>
              <div class="section" id="education">
                <h2>Education</h2>
                ${educationItems}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function exportResumeAsDoc(resume: ResumeDocument) {
  const html = buildDocHtml(resume);
  downloadBlob(new Blob([html], { type: "application/msword" }), sanitizeFileName(resume.name, "doc"));
}
