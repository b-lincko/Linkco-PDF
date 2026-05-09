import * as PDFLib from 'pdf-lib';

export async function extractTextFromPDF(bytes: Uint8Array): Promise<string[]> {
  const pdf = await PDFLib.PDFDocument.load(bytes);
  const pages: string[] = [];
  
  for (let i = 0; i < pdf.getPageCount(); i++) {
    const page = pdf.getPage(i);
    // pdf-lib doesn't have built-in text extraction, but we can get page text
    // For full text extraction, we'd need a more advanced library
    // For now, return empty strings to prevent errors
    pages.push('');
  }
  
  return pages;
}

export async function exportPageAsImage(
  bytes: Uint8Array,
  pageIndex: number,
  format: 'png' | 'jpg'
): Promise<Uint8Array | null> {
  // This would require a PDF rendering engine like pdf.js or sharp
  // For now, return null
  console.warn('Image export requires a rendering engine. Consider using pdf.js for this feature.');
  return null;
}

export async function exportText(
  bytes: Uint8Array
): Promise<string> {
  const pdf = await PDFLib.PDFDocument.load(bytes);
  let text = '';
  
  for (let i = 0; i < pdf.getPageCount(); i++) {
    const page = pdf.getPage(i);
    // Basic text extraction is limited with pdf-lib
    text += `\n--- Page ${i + 1} ---\n`;
  }
  
  return text;
}
