import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Setup worker dynamically to avoid Vite bundler worker loader issues
const pdfjsVersion = pdfjsLib.version || "4.4.168";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

/**
 * Extracts clean plaintext from an RTF document.
 * Matches backend Deno extraction behavior.
 */
export const extractRtfText = (rtf) => {
  if (!rtf) return "";
  const withHex = rtf.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const code = parseInt(hex, 16);
    return isNaN(code) ? "" : String.fromCharCode(code);
  });
  const withUnicode = withHex.replace(/\\u(-?\d+)\??/g, (_, num) => {
    const code = parseInt(num, 10);
    if (isNaN(code)) return "";
    return String.fromCharCode(code < 0 ? 65536 + code : code);
  });
  const withBreaks = withUnicode
    .replace(/\\par[d]?/gi, "\n")
    .replace(/\\line/gi, "\n")
    .replace(/\\tab/gi, "\t");

  return withBreaks
    .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * Extracts clean plaintext from a DOCX xml string.
 * Matches backend Deno extraction behavior.
 */
export const extractDocxText = (xml) => {
  if (!xml) return "";
  const withBreaks = xml
    .replace(/<w:tab\b[^>]*\/?>/g, "\t")
    .replace(/<w:br\b[^>]*\/?>/g, "\n")
    .replace(/<\/w:p>/g, "\n");

  return withBreaks
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * Parses and extracts text from supported file types client-side.
 * Extremely robust, shows real-time progress callbacks.
 * Supported formats: .txt, .rtf, .docx, .pdf
 *
 * @param {File} file - The file uploaded
 * @param {function} onProgress - Progress callback (percent 0-100)
 * @returns {Promise<string>} Clean extracted plaintext
 */
export const extractTextFromFile = async (file, onProgress) => {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  
  if (ext === ".txt") {
    onProgress?.(20);
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read TXT file"));
      reader.readAsText(file);
    });
    onProgress?.(100);
    return text;
  }

  if (ext === ".rtf") {
    onProgress?.(20);
    const rtf = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read RTF file"));
      reader.readAsText(file);
    });
    onProgress?.(60);
    const text = extractRtfText(rtf);
    onProgress?.(100);
    return text;
  }

  if (ext === ".docx") {
    onProgress?.(15);
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(40);
    const zip = await JSZip.loadAsync(arrayBuffer);
    onProgress?.(70);
    const xmlFile = zip.file("word/document.xml");
    if (!xmlFile) {
      throw new Error("Invalid DOCX file format: missing document.xml");
    }
    const xml = await xmlFile.async("text");
    onProgress?.(90);
    const text = extractDocxText(xml);
    onProgress?.(100);
    return text;
  }

  if (ext === ".pdf") {
    onProgress?.(10);
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(30);
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str || "")
        .join(" ");
      fullText += pageText + "\n";
      
      const progressPercent = 30 + Math.round((i / pdf.numPages) * 65);
      onProgress?.(progressPercent);
    }
    
    onProgress?.(100);
    return fullText.trim();
  }

  throw new Error(`Unsupported file format "${ext}". Please upload a .pdf, .docx, .rtf, or .txt file.`);
};
