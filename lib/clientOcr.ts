// Client-side OCR: reads text from a photo/scanned PDF entirely in the
// student's own browser, using pdf.js (renders the PDF's first page to an
// image) and Tesseract.js (reads text from that image). Nothing here
// touches our server — this exists specifically for certificates that are
// scanned photos rather than digitally-generated PDFs, which our server's
// free, instant native-text extraction correctly can't read.
//
// The page is read in up to three passes: once as-is, and twice more on
// high-contrast black-and-white copies. Decorative or light-colored text
// (like a name in gold script on a cream background) is often invisible to
// a single pass, but shows up once the contrast is boosted.

function thresholdCopy(source: HTMLCanvasElement, cutoff: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const sourceCtx = source.getContext("2d");
  const outCtx = out.getContext("2d");
  if (!sourceCtx || !outCtx) return source;

  const image = sourceCtx.getImageData(0, 0, source.width, source.height);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    const luminance = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const value = luminance < cutoff ? 0 : 255;
    px[i] = value;
    px[i + 1] = value;
    px[i + 2] = value;
    px[i + 3] = 255;
  }
  outCtx.putImageData(image, 0, 0);
  return out;
}

export async function extractTextFromPdfClientSide(
  file: File,
  onProgress?: (status: string) => void
): Promise<string> {
  onProgress?.("Loading your certificate...");
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const scale = 3; // higher scale = sharper image = better OCR accuracy
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the certificate image.");

  await page.render({ canvasContext: ctx, viewport }).promise;

  const Tesseract = await import("tesseract.js");
  const worker = await Tesseract.createWorker("eng");

  try {
    // Page segmentation modes as plain values: "3" = automatic layout,
    // "11" = sparse text (finds isolated lines like a lone decorative name).
    const passes: { label: string; image: HTMLCanvasElement; mode: string }[] = [
      { label: "Reading the printed text...", image: canvas, mode: "3" },
      {
        label: "Looking for lighter, decorative text (1 of 2)...",
        image: thresholdCopy(canvas, 200),
        mode: "11",
      },
      {
        label: "Looking for lighter, decorative text (2 of 2)...",
        image: thresholdCopy(canvas, 225),
        mode: "11",
      },
    ];

    const texts: string[] = [];
    for (const pass of passes) {
      onProgress?.(pass.label);
      await worker.setParameters({ tessedit_pageseg_mode: pass.mode as any });
      const { data } = await worker.recognize(pass.image);
      texts.push(data.text || "");
    }
    return texts.join("\n");
  } finally {
    await worker.terminate();
  }
}
