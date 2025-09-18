export type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: unknown) => { promise: Promise<any> };
};

export async function loadPdfjs(): Promise<PdfJsModule> {
  const candidates = [
    'pdfjs-dist/legacy/build/pdf',
    'pdfjs-dist/build/pdf',
    'pdfjs-dist',
  ];
  for (const id of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mod = await import(id);
      return mod as unknown as PdfJsModule;
    } catch {}
  }
  throw new Error('pdfjs-dist not found');
}

