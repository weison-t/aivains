declare module 'pdf-parse' {
  /**
   * Minimal type for pdf-parse used in this project.
   */
  const pdfParse: (buffer: Buffer) => Promise<{ text: string }>;
  export default pdfParse;
}

