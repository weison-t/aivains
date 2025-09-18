// Minimal PDF.js typings to avoid any
export type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
};

export type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
  render: (args: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
};

export type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string | null };
  getDocument: (opts: unknown) => { promise: Promise<PdfDocument> };
  version?: string;
};

export async function loadPdfjs(): Promise<PdfJsModule> {
  const candidates = [
    'pdfjs-dist/legacy/build/pdf',
    'pdfjs-dist/build/pdf',
    'pdfjs-dist',
  ];
  for (const id of candidates) {
    try {
      const mod = (await import(id)) as unknown as PdfJsModule;
      return mod;
    } catch {}
  }
  throw new Error('pdfjs-dist not found');
}

