// Client-side OCR: reads text from a photo/scanned PDF entirely in the
// student's own browser, using pdf.js (renders the PDF's first page to an
// image) and Tesseract.js (reads text from that image). Nothing here
// touches our server — this exists specifically for certificates that are
// scanned photos rather than digitally-generated PDFs, which our server's
// free, instant native-text extraction correctly can't read.

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

  const scale = 2; // higher scale = sharper image = better OCR accuracy
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the certificate image.");

  await page.render({ canvasContext: ctx, viewport }).promise;

  onProgress?.("Reading the text on your certificate...");
  const Tesseract = await import("tesseract.js");
  const { data } = await Tesseract.recognize(canvas, "eng");

  return data.text || "";
}
