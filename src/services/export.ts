import {
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Document as WordDocument,
} from "docx";
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

async function loadScript(src: string) {
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureSnapshotDependencies() {
  if (!window.html2canvas) {
    try {
      await loadScript("/vendor/html2canvas.min.js");
    } catch {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
      } catch {
        await loadScript("https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js");
      }
    }
  }

  if (!window.jspdf?.jsPDF) {
    try {
      await loadScript("/vendor/jspdf.umd.min.js");
    } catch {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
      } catch {
        await loadScript("https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js");
      }
    }
  }

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error("Export libraries could not be loaded. Please check your network and try again.");
  }
}

async function waitForPreviewReady() {
  if ("fonts" in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // no-op
    }
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function sliceCanvas(canvas: HTMLCanvasElement, targetPageHeightPx: number) {
  const pages: HTMLCanvasElement[] = [];
  const totalPages = Math.max(1, Math.ceil(canvas.height / targetPageHeightPx));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const page = document.createElement("canvas");
    const sliceHeight = Math.min(targetPageHeightPx, canvas.height - pageIndex * targetPageHeightPx);
    page.width = canvas.width;
    page.height = sliceHeight;

    const context = page.getContext("2d");
    if (!context) {
      continue;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, page.width, page.height);
    context.drawImage(
      canvas,
      0,
      pageIndex * targetPageHeightPx,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    pages.push(page);
  }

  return pages;
}

async function capturePreviewCanvas(element: HTMLElement) {
  await ensureSnapshotDependencies();
  await waitForPreviewReady();

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "visible";

  try {
    const rect = element.getBoundingClientRect();
    return await window.html2canvas!(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: Math.ceil(rect.width),
      height: Math.ceil(element.scrollHeight),
      windowWidth: Math.max(document.documentElement.clientWidth, Math.ceil(rect.width)),
      windowHeight: Math.max(document.documentElement.clientHeight, Math.ceil(element.scrollHeight)),
      scrollX: 0,
      scrollY: -window.scrollY,
    });
  } finally {
    document.body.style.overflow = previousOverflow;
  }
}

export async function exportResumeAsPdf(element: HTMLElement, fileName: string) {
  const canvas = await capturePreviewCanvas(element);
  const pdf = new window.jspdf!.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const renderWidth = pageWidth - margin * 2;
  const ratio = renderWidth / canvas.width;
  const pageHeightPx = Math.floor((pageHeight - margin * 2) / ratio);
  const pages = sliceCanvas(canvas, pageHeightPx);

  pages.forEach((pageCanvas, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      pageCanvas.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      renderWidth,
      pageCanvas.height * ratio,
      undefined,
      "FAST"
    );
  });

  pdf.save(fileName);
}

export async function exportResumeAsPng(element: HTMLElement, fileName: string) {
  const canvas = await capturePreviewCanvas(element);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    throw new Error("Unable to generate PNG.");
  }
  downloadBlob(blob, fileName);
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

async function canvasToUint8Array(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    throw new Error("Unable to serialize preview image.");
  }
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function exportResumeAsDocx(element: HTMLElement, resume: ResumeDocument) {
  const canvas = await capturePreviewCanvas(element);
  const pageWidthPx = 1500;
  const pageHeightPx = 2120;
  const pages = sliceCanvas(canvas, Math.floor((pageHeightPx / pageWidthPx) * canvas.width));
  const doc = new WordDocument({
    sections: [
      {
        children: await Promise.all(
          pages.flatMap((pageCanvas, index) => {
            const width = 560;
            const height = Math.round((pageCanvas.height / pageCanvas.width) * width);

            const paragraph = canvasToUint8Array(pageCanvas).then(
              (bytes) =>
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: bytes,
                      transformation: { width, height },
                    }),
                  ],
                })
            );

            if (index === pages.length - 1) {
              return [paragraph];
            }

            return [
              paragraph,
              Promise.resolve(
                new Paragraph({
                  children: [new PageBreak()],
                })
              ),
            ];
          })
        ),
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

export async function exportResumeAsDoc(element: HTMLElement, resume: ResumeDocument) {
  const canvas = await capturePreviewCanvas(element);
  const pages = sliceCanvas(canvas, Math.floor((2120 / 1500) * canvas.width));
  const images = pages.map((pageCanvas) => pageCanvas.toDataURL("image/png"));
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(resume.name)}</title>
        <style>
          body { margin: 0; padding: 20px; background: #ffffff; }
          .page { margin: 0 auto 20px; max-width: 860px; page-break-after: always; }
          .page img { display: block; width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${images.map((src) => `<div class="page"><img src="${src}" alt="${escapeHtml(resume.name)}" /></div>`).join("")}
      </body>
    </html>
  `;
  downloadBlob(new Blob([html], { type: "application/msword" }), sanitizeFileName(resume.name, "doc"));
}
