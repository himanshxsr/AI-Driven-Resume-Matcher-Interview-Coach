/**
 * Extract text from a PDF buffer (e.g. from FormData file in /api/analyze).
 * Uses pdf-parse for buffer-based parsing; no file path required.
 */

import pdfParse from "pdf-parse";

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text?.trim() ?? "";
}
