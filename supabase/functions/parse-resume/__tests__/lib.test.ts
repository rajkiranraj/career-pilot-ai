import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { strToU8, zipSync } from "https://esm.sh/fflate@0.8.2";
import {
  MAX_FILE_BYTES,
  ResumeParseError,
  estimateBase64Bytes,
  normalizeMimeType,
  parseAiResponse,
  prepareResumeInput,
} from "../lib.ts";

Deno.test("normalizeMimeType uses file extension fallback", () => {
  const normalized = normalizeMimeType("", "resume.PDF");
  assertEquals(normalized, "application/pdf");
});

Deno.test("estimateBase64Bytes matches encoded length", () => {
  const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
  const base64 = encodeBase64(bytes);
  assertEquals(estimateBase64Bytes(base64), bytes.length);
});

Deno.test("prepareResumeInput handles plain text", async () => {
  const base64 = encodeBase64("Hello resume");
  const prepared = await prepareResumeInput({
    fileBase64: base64,
    mimeType: "text/plain",
    fileName: "resume.txt",
  });
  assertEquals(prepared.mode, "text");
  assertStringIncludes(prepared.text || "", "Hello resume");
});

Deno.test("prepareResumeInput handles RTF", async () => {
  const rtf = "{\\rtf1\\ansi Hello\\par World}";
  const base64 = encodeBase64(rtf);
  const prepared = await prepareResumeInput({
    fileBase64: base64,
    mimeType: "application/rtf",
    fileName: "resume.rtf",
  });
  assertEquals(prepared.mode, "text");
  assertStringIncludes(prepared.text || "", "Hello");
  assertStringIncludes(prepared.text || "", "World");
});

Deno.test("prepareResumeInput handles DOCX", async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Hello DOCX</w:t></w:r></w:p>
  </w:body>
</w:document>`;
  const docxBytes = zipSync({ "word/document.xml": strToU8(xml) });
  const base64 = encodeBase64(docxBytes);
  const prepared = await prepareResumeInput({
    fileBase64: base64,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileName: "resume.docx",
  });
  assertEquals(prepared.mode, "text");
  assertStringIncludes(prepared.text || "", "Hello DOCX");
});

Deno.test("prepareResumeInput handles resumeText", async () => {
  const prepared = await prepareResumeInput({
    resumeText: "Hello PDF",
    mimeType: "application/pdf",
    fileName: "resume.pdf",
  });
  assertEquals(prepared.mode, "text");
  assertStringIncludes(prepared.text || "", "Hello PDF");
});

Deno.test("prepareResumeInput accepts 10 MB TXT", async () => {
  const text = "A".repeat(MAX_FILE_BYTES);
  const base64 = encodeBase64(text);
  const prepared = await prepareResumeInput({
    fileBase64: base64,
    mimeType: "text/plain",
    fileName: "resume.txt",
  });
  assertEquals(prepared.mode, "text");
});

Deno.test("prepareResumeInput rejects >10 MB files", async () => {
  const bytes = new Uint8Array(MAX_FILE_BYTES + 1);
  const base64 = encodeBase64(bytes);
  await assertRejects(
    () =>
      prepareResumeInput({
        fileBase64: base64,
        mimeType: "text/plain",
        fileName: "resume.txt",
      }),
    ResumeParseError,
  );
});

Deno.test("parseAiResponse handles JSON in fences", () => {
  const json = "```json\n{\"name\":\"Ada\",\"skills\":[\"Go\"]}\n```";
  const result = parseAiResponse(json);
  assertEquals(result.partial, false);
  assertEquals(result.parsed.name, "Ada");
  assertEquals(result.parsed.skills[0], "Go");
});
