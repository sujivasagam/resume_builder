import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  AlignmentType,
  Document as WordDocument,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
} from "docx";
import { ResumeDocument } from "../types";

const SNAPSHOT_PAGE_WIDTH_PX = 1500;
const SNAPSHOT_PAGE_HEIGHT_PX = 2120;
const PDF_MARGIN_PT = 18;
const DOCX_PAGE_WIDTH_TWIP = 11906;
const DOCX_PAGE_HEIGHT_TWIP = 16838;
const DOCX_MARGIN_TWIP = 360;
const DOCX_IMAGE_WIDTH_PX = 718;
type ExportSurface = "pdf" | "doc" | "docx";

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

async function ensurePdfDependency() { return; }

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

function normalizeInteractiveCloneForStaticExport(clone: HTMLElement) {
  if (clone.dataset.templateId !== "interactive") {
    return;
  }

  clone.querySelector("nav")?.remove();
  clone.querySelectorAll('a[href^="#"]').forEach((link) => {
    const replacement = document.createElement("span");
    replacement.className = link.className;
    replacement.textContent = link.textContent;
    link.replaceWith(replacement);
  });
}

function inlineComputedStyles(source: HTMLElement, target: HTMLElement) {
  const computedStyle = getComputedStyle(source);

  Array.from(computedStyle).forEach((property) => {
    const value = computedStyle.getPropertyValue(property);
    const priority = computedStyle.getPropertyPriority(property);
    if (!value) {
      return;
    }

    target.style.setProperty(property, value, priority);
  });

  target.removeAttribute("class");

  const sourceChildren = Array.from(source.children) as HTMLElement[];
  const targetChildren = Array.from(target.children) as HTMLElement[];
  sourceChildren.forEach((child, index) => {
    const matchingTarget = targetChildren[index];
    if (matchingTarget) {
      inlineComputedStyles(child, matchingTarget);
    }
  });
}

function createExportClone(element: HTMLElement, format: ExportSurface) {
  const rect = element.getBoundingClientRect();
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-100000px";
  wrapper.style.top = "0";
  wrapper.style.zIndex = "-1";
  wrapper.style.pointerEvents = "none";
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0";
  wrapper.style.margin = "0";
  wrapper.style.width = `${Math.ceil(rect.width)}px`;
  wrapper.style.overflow = "visible";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${Math.ceil(rect.width)}px`;
  clone.style.maxWidth = "none";
  clone.style.margin = "0";

  normalizeInteractiveCloneForStaticExport(clone);

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  inlineComputedStyles(element, clone);

  return { wrapper, clone, width: Math.ceil(rect.width) };
}

async function renderCloneToCanvas(clone: HTMLElement, width: number) {
  const height = Math.max(1, Math.ceil(clone.scrollHeight));
  const scale = 2;
  const clonedMarkup = new XMLSerializer().serializeToString(clone);
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">
          ${clonedMarkup}
        </div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Unable to render resume preview for export."));
      nextImage.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create export canvas context.");
    }

    context.scale(scale, scale);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
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


async function capturePreviewCanvas(element: HTMLElement, format: ExportSurface) {
  await waitForPreviewReady();

  if (!element.isConnected) {
    throw new Error("Resume preview is not mounted.");
  }

  const clonedElement = element.cloneNode(true) as HTMLElement;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-99999px";
  wrapper.style.top = "0";
  wrapper.style.background = "#ffffff";
  wrapper.style.width = `${element.offsetWidth}px`;

  wrapper.appendChild(clonedElement);
  document.body.appendChild(wrapper);

  wrapper.querySelectorAll("*").forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.className = "";
    htmlEl.style.color = "#000000";
    htmlEl.style.backgroundColor = "#ffffff";
    htmlEl.style.borderColor = "#d1d5db";
  });

  try {
    return await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

async function createSnapshotPages(element: HTMLElement, format: ExportSurface) {
  const canvas = await capturePreviewCanvas(element, format);
  const pageHeightPx = Math.floor((SNAPSHOT_PAGE_HEIGHT_PX / SNAPSHOT_PAGE_WIDTH_PX) * canvas.width);
  return { canvas, pages: sliceCanvas(canvas, pageHeightPx) };
}

export async function exportResumeAsPdf(element: HTMLElement, fileName: string, _resume?: ResumeDocument) {
  await ensurePdfDependency();
  console.info("[Resume Export] Using preview snapshot renderer for PDF export");

  const { canvas } = await createSnapshotPages(element, "pdf");
  const pdf = new jsPDF({
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

  pdf.save(sanitizeFileName(`${fileName.replace(/\.pdf$/i, "")}_Resume`, "pdf"));
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
            font-family: "Segoe UI", Arial, sans-serif;
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
  console.info("[Resume Export] Using preview snapshot renderer for DOCX export");
  const { pages } = await createSnapshotPages(element, "docx");

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

            return [paragraph, Promise.resolve(new Paragraph({ children: [new PageBreak()] }))];
          })
        ),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, sanitizeFileName(`${resume.name}_Resume`, "docx"));
}

export async function exportResumeAsDoc(element: HTMLElement, resume: ResumeDocument) {
  console.info("[Resume Export] Using preview snapshot renderer for DOC export");
  const { pages } = await createSnapshotPages(element, "doc");
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

  downloadBlob(new Blob([html], { type: "application/vnd.ms-word" }), sanitizeFileName(`${resume.name}_Resume`, "doc"));
}
