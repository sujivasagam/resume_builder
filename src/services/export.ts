import {
  AlignmentType,
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

const SNAPSHOT_PAGE_WIDTH_PX = 1500;
const SNAPSHOT_PAGE_HEIGHT_PX = 2120;
const PDF_MARGIN_PT = 18;
const DOCX_PAGE_WIDTH_TWIP = 11906;
const DOCX_PAGE_HEIGHT_TWIP = 16838;
const DOCX_MARGIN_TWIP = 360;
const DOCX_IMAGE_WIDTH_PX = 718;

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
    await loadScript("/vendor/html2canvas.min.js");
  }

  if (!window.jspdf?.jsPDF) {
    await loadScript("/vendor/jspdf.umd.min.js");
  }

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error("Export libraries could not be loaded.");
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

async function createSnapshotPages(element: HTMLElement) {
  const canvas = await capturePreviewCanvas(element);
  const pageHeightPx = Math.floor((SNAPSHOT_PAGE_HEIGHT_PX / SNAPSHOT_PAGE_WIDTH_PX) * canvas.width);
  return { canvas, pages: sliceCanvas(canvas, pageHeightPx) };
}

export async function exportResumeAsPdf(element: HTMLElement, fileName: string) {
  const { canvas } = await createSnapshotPages(element);
  const pdf = new window.jspdf!.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const renderWidth = pageWidth - PDF_MARGIN_PT * 2;
  const ratio = renderWidth / canvas.width;
  const pageHeightPx = Math.floor((pageHeight - PDF_MARGIN_PT * 2) / ratio);
  const pages = sliceCanvas(canvas, pageHeightPx);

  pages.forEach((pageCanvas, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      pageCanvas.toDataURL("image/png"),
      "PNG",
      PDF_MARGIN_PT,
      PDF_MARGIN_PT,
      renderWidth,
      pageCanvas.height * ratio,
      undefined,
      "FAST"
    );
  });

  pdf.save(fileName);
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
  const { pages } = await createSnapshotPages(element);
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
        children: await Promise.all(
          pages.flatMap((pageCanvas, index) => {
            const width = DOCX_IMAGE_WIDTH_PX;
            const height = Math.round((pageCanvas.height / pageCanvas.width) * width);

            const paragraph = canvasToUint8Array(pageCanvas).then(
              (bytes) =>
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: bytes,
                      type: "png",
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

export async function exportResumeAsDoc(element: HTMLElement, resume: ResumeDocument) {
  const { pages } = await createSnapshotPages(element);
  const images = pages.map((pageCanvas) => pageCanvas.toDataURL("image/png"));
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(resume.name)}</title>
        <style>
          @page { size: A4 portrait; margin: 0.25in; }
          body { margin: 0; padding: 0; background: #ffffff; }
          .page { width: 7.77in; margin: 0 auto 0.2in; page-break-after: always; }
          .page:last-child { page-break-after: auto; }
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
