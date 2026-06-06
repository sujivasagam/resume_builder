import {
  AlignmentType,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TableOfContents,
  TextRun,
  Document as WordDocument,
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
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1280,height=960");
  if (!popup) {
    throw new Error("The browser blocked the PDF window. Please allow popups and try again.");
  }

  const styles = getAbsoluteStylesMarkup();

  popup.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(fileName)}</title>
        ${styles}
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          html, body { margin: 0; background: #ffffff; }
          body { padding: 18px; }
          .pdf-export-shell { max-width: 1100px; margin: 0 auto; }
          .pdf-export-helper {
            position: sticky;
            top: 0;
            z-index: 20;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
            border-radius: 18px;
            background: rgba(15, 23, 42, 0.94);
            color: white;
            padding: 14px 16px;
            font-family: Inter, sans-serif;
          }
          .pdf-export-helper button {
            border: 0;
            border-radius: 999px;
            padding: 10px 14px;
            font: inherit;
            font-weight: 600;
            cursor: pointer;
          }
          .pdf-export-primary { background: white; color: #0f172a; }
          .pdf-export-secondary { background: rgba(255,255,255,0.12); color: white; }
          @media print {
            .pdf-export-helper { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="pdf-export-helper">
          <span>Use the print dialog and choose "Save as PDF" for the closest browser-rendered result.</span>
          <div>
            <button class="pdf-export-primary" onclick="window.print()">Save as PDF</button>
            <button class="pdf-export-secondary" onclick="window.close()">Close</button>
          </div>
        </div>
        <div class="pdf-export-shell">${element.outerHTML}</div>
      </body>
    </html>
  `);
  popup.document.close();
}

export async function exportResumeAsPng(element: HTMLElement, fileName: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1280,height=960");
  if (!popup) {
    throw new Error("The browser blocked the PNG helper window. Please allow popups and try again.");
  }

  const styles = getAbsoluteStylesMarkup();
  popup.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(fileName)}</title>
        ${styles}
        <style>
          body { margin: 0; padding: 18px; background: #ffffff; }
          .png-export-shell { max-width: 1100px; margin: 0 auto; }
          .png-export-helper {
            margin-bottom: 16px;
            border-radius: 18px;
            background: rgba(15, 23, 42, 0.94);
            color: white;
            padding: 14px 16px;
            font-family: Inter, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="png-export-helper">Use your system screenshot or browser capture tools for a pixel-perfect image from this page.</div>
        <div class="png-export-shell">${element.outerHTML}</div>
      </body>
    </html>
  `);
  popup.document.close();
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

function headingParagraph(text: string, tokens: ReturnType<typeof getThemeTokens>, level: keyof typeof HeadingLevel = "HEADING_1") {
  return new Paragraph({
    heading: HeadingLevel[level],
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: tokens.heading.replace("#", ""),
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
          new Paragraph({
            spacing: { before: 120, after: 80 },
            children: [
              new TextRun({
                text: "Navigate Sections",
                bold: true,
                color: tokens.accent.replace("#", ""),
                size: 22,
              }),
            ],
          }),
          new TableOfContents("Contents", {
            hyperlink: true,
            headingStyleRange: "1-1",
          }),
          new Paragraph({
            spacing: { before: 60, after: 180 },
            children: [
              new TextRun({
                text: "If Word asks to update fields, choose update so the section navigation is generated correctly.",
                italics: true,
                color: tokens.text.replace("#", ""),
                size: 18,
              }),
            ],
          }),
          headingParagraph("Professional Summary", tokens),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: resume.personal.summary, color: tokens.text.replace("#", ""), size: 22 })],
          }),
          headingParagraph("Experience", tokens),
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
          headingParagraph("Projects", tokens),
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
          headingParagraph("Skills", tokens),
          new Paragraph({
            spacing: { after: 180 },
            children: [new TextRun({ text: resume.skills.join("  |  "), color: tokens.text.replace("#", "") })],
          }),
          headingParagraph("Certifications", tokens),
          ...resume.certifications.map(
            (entry) =>
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: `${entry.name} | ${entry.issuer}`, bold: true, color: tokens.heading.replace("#", "") }),
                  new TextRun({ text: `\n${entry.date}${entry.credentialId ? ` | ${entry.credentialId}` : ""}`, color: tokens.text.replace("#", "") }),
                ],
              })
          ),
          headingParagraph("Achievements", tokens),
          ...resume.achievements.map(
            (item) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 40 },
                children: [new TextRun({ text: item, color: tokens.text.replace("#", "") })],
              })
          ),
          headingParagraph("Education", tokens),
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
          headingParagraph("Languages", tokens),
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: resume.languages.join(" | "), color: tokens.text.replace("#", "") })],
          }),
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
          .nav span { display: inline-block; margin: 0 8px 8px 0; padding: 8px 14px; background: rgba(255,255,255,0.14); color: white; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; }
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
              <span>Summary</span>
              <span>Experience</span>
              <span>Projects</span>
              <span>Skills</span>
              <span>Education</span>
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
