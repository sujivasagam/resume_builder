import {
  AlignmentType,
  Document as WordDocument,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
  UnderlineType,
} from "docx";
import { ResumeDocument } from "../types";

declare global {
  interface Window {
    jspdf?: {
      jsPDF: new (options?: Record<string, unknown>) => {
        internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
        addPage: () => void;
        line: (x1: number, y1: number, x2: number, y2: number) => void;
        save: (fileName: string) => void;
        setDrawColor: (r: number, g?: number, b?: number) => void;
        setFont: (fontName: string, fontStyle?: string) => void;
        setFontSize: (size: number) => void;
        setTextColor: (r: number, g?: number, b?: number) => void;
        splitTextToSize: (text: string, size: number) => string[];
        text: (text: string | string[], x: number, y: number) => void;
      };
    };
  }
}

const PDF_MARGIN = 40;
const PDF_LINE_HEIGHT = 16;
const PDF_SECTION_GAP = 14;

const DOCX_PAGE_WIDTH_TWIP = 11906;
const DOCX_PAGE_HEIGHT_TWIP = 16838;
const DOCX_MARGIN_TWIP = 720;

async function loadScript(src: string) {
  const absoluteSrc = new URL(src, window.location.href).href;
  const existing = document.querySelector(`script[src="${src}"], script[src="${absoluteSrc}"]`) as HTMLScriptElement | null;

  if (src.includes("jspdf") && window.jspdf?.jsPDF) {
    return;
  }

  if (existing) {
    if (existing.dataset.loaded === "true") {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error(`Timed out loading ${src}`)), 10000);
      const handleLoad = () => {
        window.clearTimeout(timeout);
        existing.dataset.loaded = "true";
        resolve();
      };
      const handleError = () => {
        window.clearTimeout(timeout);
        reject(new Error(`Failed to load ${src}`));
      };

      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = absoluteSrc;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePdfDependency() {
  if (!window.jspdf?.jsPDF) {
    await loadScript("/vendor/jspdf.umd.min.js");
  }

  if (!window.jspdf?.jsPDF) {
    throw new Error("PDF export library could not be loaded.");
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 2000);
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

function compact(values: Array<string | undefined | null>) {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value));
}

function buildContactLines(resume: ResumeDocument) {
  const { personal } = resume;
  const lineOne = compact([personal.email, personal.phone, personal.location]);
  const lineTwo = compact([personal.linkedin, personal.github, personal.portfolio]);
  return [lineOne, lineTwo].filter((line) => line.length > 0);
}

function bulletLines(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => `- ${value}`);
}

function buildProjectLines(resume: ResumeDocument) {
  return resume.projects.flatMap((project) => {
    const lines = [
      `${project.name}${project.url ? ` (${project.url})` : ""}`,
      project.summary,
      project.stack.length ? `Stack: ${project.stack.join(", ")}` : "",
      ...bulletLines(project.outcomes),
    ].filter(Boolean);

    return lines;
  });
}

function buildCertificationLines(resume: ResumeDocument) {
  return resume.certifications.map((certification) =>
    compact([
      certification.name,
      certification.issuer,
      certification.date,
      certification.credentialId ? `Credential ID: ${certification.credentialId}` : "",
    ]).join(" | ")
  );
}

function buildEducationLines(resume: ResumeDocument) {
  return resume.education.map((education) =>
    compact([education.degree, education.school, education.period, education.score]).join(" | ")
  );
}

function buildResumeHtml(resume: ResumeDocument) {
  const contactLines = buildContactLines(resume);
  const experienceMarkup = resume.experience
    .map(
      (experience) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>${escapeHtml(experience.role)}</h3>
              <p class="sub">${escapeHtml(experience.company)}</p>
            </div>
            <div class="meta">
              ${escapeHtml(`${experience.start} - ${experience.end}`)}<br />
              ${escapeHtml(experience.location)}
            </div>
          </div>
          <ul>${bulletLines(experience.highlights).map((line) => `<li>${escapeHtml(line.slice(2))}</li>`).join("")}</ul>
        </div>
      `
    )
    .join("");

  const projectsMarkup = resume.projects
    .map(
      (project) => `
        <div class="item">
          <h3>${escapeHtml(project.name)}</h3>
          <p class="sub">${project.url ? escapeHtml(project.url) : ""}</p>
          <p>${escapeHtml(project.summary)}</p>
          ${project.stack.length ? `<p><strong>Stack:</strong> ${escapeHtml(project.stack.join(", "))}</p>` : ""}
          ${project.outcomes.length ? `<ul>${project.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join("")}</ul>` : ""}
        </div>
      `
    )
    .join("");

  const section = (title: string, body: string) => (body.trim() ? `<section><h2>${escapeHtml(title)}</h2>${body}</section>` : "");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(resume.name)}</title>
        <style>
          @page { size: A4; margin: 0.6in; }
          body {
            margin: 0;
            color: #0f172a;
            background: #ffffff;
            font-family: "Segoe UI", Arial, sans-serif;
            line-height: 1.45;
          }
          .sheet {
            max-width: 8in;
            margin: 0 auto;
          }
          header {
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
            line-height: 1.1;
          }
          .role {
            margin-top: 6px;
            font-size: 14px;
            color: #334155;
            font-weight: 600;
          }
          .contact-line {
            margin-top: 8px;
            font-size: 11px;
            color: #475569;
          }
          section {
            margin-top: 18px;
          }
          h2 {
            margin: 0 0 8px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #1d4ed8;
          }
          h3 {
            margin: 0;
            font-size: 14px;
          }
          p {
            margin: 6px 0 0;
            font-size: 12px;
          }
          .sub {
            color: #475569;
          }
          .item {
            margin-top: 10px;
          }
          .item-head {
            display: flex;
            justify-content: space-between;
            gap: 16px;
          }
          .meta {
            text-align: right;
            font-size: 11px;
            color: #475569;
            white-space: nowrap;
          }
          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }
          li {
            margin-top: 4px;
            font-size: 12px;
          }
          .chips {
            margin-top: 8px;
          }
          .chip {
            display: inline-block;
            margin: 0 6px 6px 0;
            padding: 4px 8px;
            border-radius: 999px;
            background: #eff6ff;
            color: #1e3a8a;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <header>
            <h1>${escapeHtml(resume.personal.fullName || resume.name)}</h1>
            <div class="role">${escapeHtml(resume.personal.title || resume.targetRole)}</div>
            ${contactLines.map((line) => `<div class="contact-line">${line.map(escapeHtml).join(" | ")}</div>`).join("")}
          </header>

          ${section("Professional Summary", `<p>${escapeHtml(resume.personal.summary || "")}</p>`)}
          ${section("Experience", experienceMarkup)}
          ${section("Projects", projectsMarkup)}
          ${section("Skills", `<div class="chips">${resume.skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div>`)}
          ${section("Education", buildEducationLines(resume).map((line) => `<p>${escapeHtml(line)}</p>`).join(""))}
          ${section("Certifications", buildCertificationLines(resume).map((line) => `<p>${escapeHtml(line)}</p>`).join(""))}
          ${section("Achievements", resume.achievements.length ? `<ul>${resume.achievements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "")}
          ${section("Awards", resume.awards.length ? `<ul>${resume.awards.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "")}
          ${section("Languages", resume.languages.length ? `<p>${escapeHtml(resume.languages.join(", "))}</p>` : "")}
          ${section("References", resume.references.length ? `<p>${escapeHtml(resume.references.join(", "))}</p>` : "")}
        </div>
      </body>
    </html>
  `;
}

function buildDocxParagraphs(resume: ResumeDocument) {
  const paragraphs: Paragraph[] = [];
  const contactLines = buildContactLines(resume);

  paragraphs.push(
    new Paragraph({
      text: resume.personal.fullName || resume.name,
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resume.personal.title || resume.targetRole,
          bold: true,
          size: 24,
          color: "334155",
        }),
      ],
      spacing: { after: 180 },
    })
  );

  contactLines.forEach((line) => {
    paragraphs.push(
      new Paragraph({
        children: line.flatMap((item, index) => {
          const isLink = item.includes(".") && !item.includes(" ");
          const children = isLink
            ? [
                new ExternalHyperlink({
                  link: item.startsWith("http") ? item : `https://${item}`,
                  children: [
                    new TextRun({
                      text: item,
                      color: "1D4ED8",
                      underline: { type: UnderlineType.SINGLE },
                    }),
                  ],
                }),
              ]
            : [new TextRun({ text: item })];

          if (index === line.length - 1) {
            return children;
          }

          return [...children, new TextRun({ text: " | " })];
        }),
        spacing: { after: 80 },
      })
    );
  });

  const addHeading = (text: string) => {
    paragraphs.push(
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
        spacing: { before: 220, after: 120 },
      })
    );
  };

  const addBodyParagraph = (text: string, options?: { bullet?: boolean; bold?: boolean; indent?: number }) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options?.bold,
          }),
        ],
        bullet: options?.bullet ? { level: 0 } : undefined,
        indent: options?.indent ? { left: options.indent } : undefined,
        spacing: { after: 70 },
      })
    );
  };

  if (resume.personal.summary) {
    addHeading("Professional Summary");
    addBodyParagraph(resume.personal.summary);
  }

  if (resume.experience.length) {
    addHeading("Experience");
    resume.experience.forEach((experience) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: experience.role, bold: true }),
            new TextRun({ text: `\t${experience.start} - ${experience.end}` }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { after: 60 },
        })
      );
      addBodyParagraph(`${experience.company} | ${experience.location}`);
      experience.highlights.forEach((highlight) => addBodyParagraph(highlight, { bullet: true, indent: 360 }));
    });
  }

  if (resume.projects.length) {
    addHeading("Projects");
    resume.projects.forEach((project) => {
      addBodyParagraph(project.name, { bold: true });
      if (project.url) {
        addBodyParagraph(project.url);
      }
      addBodyParagraph(project.summary);
      if (project.stack.length) {
        addBodyParagraph(`Stack: ${project.stack.join(", ")}`);
      }
      project.outcomes.forEach((outcome) => addBodyParagraph(outcome, { bullet: true, indent: 360 }));
    });
  }

  if (resume.skills.length) {
    addHeading("Skills");
    addBodyParagraph(resume.skills.join(", "));
  }

  if (resume.education.length) {
    addHeading("Education");
    resume.education.forEach((education) => {
      addBodyParagraph(compact([education.degree, education.school, education.period, education.score]).join(" | "));
    });
  }

  if (resume.certifications.length) {
    addHeading("Certifications");
    resume.certifications.forEach((certification) => {
      addBodyParagraph(compact([certification.name, certification.issuer, certification.date, certification.credentialId]).join(" | "));
    });
  }

  if (resume.achievements.length) {
    addHeading("Achievements");
    resume.achievements.forEach((achievement) => addBodyParagraph(achievement, { bullet: true }));
  }

  if (resume.awards.length) {
    addHeading("Awards");
    resume.awards.forEach((award) => addBodyParagraph(award, { bullet: true }));
  }

  if (resume.languages.length) {
    addHeading("Languages");
    addBodyParagraph(resume.languages.join(", "));
  }

  if (resume.references.length) {
    addHeading("References");
    addBodyParagraph(resume.references.join(", "));
  }

  return paragraphs;
}

export async function exportResumeAsPdf(_element: HTMLElement, fileName: string, resume?: ResumeDocument) {
  if (!resume) {
    throw new Error("Resume data is required for PDF export.");
  }

  await ensurePdfDependency();
  console.info("[Resume Export] Using structured data renderer for PDF export");

  const pdf = new window.jspdf!.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PDF_MARGIN * 2;
  let cursorY = PDF_MARGIN;

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight <= pageHeight - PDF_MARGIN) {
      return;
    }

    pdf.addPage();
    cursorY = PDF_MARGIN;
  };

  const addWrappedText = (text: string, options?: { size?: number; bold?: boolean; color?: [number, number, number] }) => {
    if (!text.trim()) {
      return;
    }

    const size = options?.size ?? 11;
    const color = options?.color ?? [15, 23, 42];
    const style = options?.bold ? "bold" : "normal";
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);

    const lines = pdf.splitTextToSize(text, contentWidth);
    const blockHeight = lines.length * (size + 3);
    ensureSpace(blockHeight);
    pdf.text(lines, PDF_MARGIN, cursorY);
    cursorY += blockHeight;
  };

  const addSectionTitle = (title: string) => {
    cursorY += PDF_SECTION_GAP;
    ensureSpace(30);
    pdf.setDrawColor(29, 78, 216);
    pdf.line(PDF_MARGIN, cursorY, pageWidth - PDF_MARGIN, cursorY);
    cursorY += 14;
    addWrappedText(title.toUpperCase(), { size: 12, bold: true, color: [29, 78, 216] });
    cursorY += 2;
  };

  addWrappedText(resume.personal.fullName || resume.name, { size: 22, bold: true });
  addWrappedText(resume.personal.title || resume.targetRole, { size: 12, bold: true, color: [51, 65, 85] });
  buildContactLines(resume).forEach((line) => addWrappedText(line.join(" | "), { size: 10, color: [71, 85, 105] }));

  if (resume.personal.summary) {
    addSectionTitle("Professional Summary");
    addWrappedText(resume.personal.summary);
  }

  if (resume.experience.length) {
    addSectionTitle("Experience");
    resume.experience.forEach((experience) => {
      addWrappedText(`${experience.role} | ${experience.company}`, { size: 12, bold: true });
      addWrappedText(`${experience.start} - ${experience.end} | ${experience.location}`, { size: 10, color: [71, 85, 105] });
      bulletLines(experience.highlights).forEach((line) => addWrappedText(line));
      cursorY += 4;
    });
  }

  if (resume.projects.length) {
    addSectionTitle("Projects");
    resume.projects.forEach((project) => {
      addWrappedText(project.name, { size: 12, bold: true });
      if (project.url) {
        addWrappedText(project.url, { size: 10, color: [29, 78, 216] });
      }
      addWrappedText(project.summary);
      if (project.stack.length) {
        addWrappedText(`Stack: ${project.stack.join(", ")}`, { size: 10, color: [71, 85, 105] });
      }
      bulletLines(project.outcomes).forEach((line) => addWrappedText(line));
      cursorY += 4;
    });
  }

  if (resume.skills.length) {
    addSectionTitle("Skills");
    addWrappedText(resume.skills.join(", "));
  }

  if (resume.education.length) {
    addSectionTitle("Education");
    buildEducationLines(resume).forEach((line) => addWrappedText(line));
  }

  if (resume.certifications.length) {
    addSectionTitle("Certifications");
    buildCertificationLines(resume).forEach((line) => addWrappedText(line));
  }

  if (resume.achievements.length) {
    addSectionTitle("Achievements");
    bulletLines(resume.achievements).forEach((line) => addWrappedText(line));
  }

  if (resume.awards.length) {
    addSectionTitle("Awards");
    bulletLines(resume.awards).forEach((line) => addWrappedText(line));
  }

  if (resume.languages.length) {
    addSectionTitle("Languages");
    addWrappedText(resume.languages.join(", "));
  }

  if (resume.references.length) {
    addSectionTitle("References");
    addWrappedText(resume.references.join(", "));
  }

  pdf.save(sanitizeFileName(fileName.replace(/\.pdf$/i, ""), "pdf"));
}

function getAbsoluteStylesMarkup() {
  return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => {
      if (node.tagName.toLowerCase() === "link") {
        const link = node as HTMLLinkElement;
        const absoluteHref = new URL(link.href, window.location.href).href;
        return `<link rel="stylesheet" href="${absoluteHref}" />`;
      }

      return node.outerHTML;
    })
    .join("\n");
}

export function exportResumeAsInteractiveHtml(element: HTMLElement, fileName: string) {
  const styles = getAbsoluteStylesMarkup();
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(fileName)}</title>
        ${styles}
        <style>
          body {
            margin: 0;
            padding: 24px;
            background:
              radial-gradient(circle at top, rgba(191, 219, 254, 0.4), transparent 24%),
              linear-gradient(180deg, rgb(241, 245, 249), rgb(226, 232, 240));
          }
          .interactive-export-shell {
            max-width: 1100px;
            margin: 0 auto;
          }
          .interactive-export-helper {
            position: sticky;
            top: 12px;
            z-index: 30;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
            border-radius: 20px;
            background: rgba(15, 23, 42, 0.92);
            color: white;
            padding: 14px 18px;
            font-family: Inter, sans-serif;
          }
          .interactive-export-helper a {
            color: white;
            text-decoration: underline;
          }
          @media (max-width: 640px) {
            body { padding: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="interactive-export-shell">
          <div class="interactive-export-helper">
            <span>This file preserves the live preview design and section navigation best in a browser.</span>
            <span>Use your browser print dialog if you want a PDF snapshot from this exact view.</span>
          </div>
          ${element.outerHTML}
        </div>
        <script>
          document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
              const href = link.getAttribute('href');
              if (!href) return;
              const target = document.querySelector(href);
              if (!target) return;
              event.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          });
        <\/script>
      </body>
    </html>
  `;

  downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), sanitizeFileName(fileName.replace(/\.html$/i, ""), "html"));
}

export async function exportResumeAsDocx(_element: HTMLElement, resume: ResumeDocument) {
  console.info("[Resume Export] Using structured data renderer for DOCX export");

  const doc = new WordDocument({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: DOCX_PAGE_WIDTH_TWIP,
              height: DOCX_PAGE_HEIGHT_TWIP,
            },
            margin: {
              top: DOCX_MARGIN_TWIP,
              right: DOCX_MARGIN_TWIP,
              bottom: DOCX_MARGIN_TWIP,
              left: DOCX_MARGIN_TWIP,
            },
          },
        },
        children: buildDocxParagraphs(resume),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, sanitizeFileName(resume.name, "docx"));
}

export async function exportResumeAsDoc(_element: HTMLElement, resume: ResumeDocument) {
  console.info("[Resume Export] Using structured data renderer for DOC export");
  const html = buildResumeHtml(resume);
  downloadBlob(new Blob([html], { type: "application/msword" }), sanitizeFileName(resume.name, "doc"));
}
