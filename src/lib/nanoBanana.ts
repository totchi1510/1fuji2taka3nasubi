import { Buffer } from "node:buffer";

import { GoogleGenAI, Modality } from "@google/genai";

function contentTypeToExt(contentType: string): string {
  const ct = contentType.toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "bin";
}

export type NanoBananaImage = {
  bytes: Uint8Array;
  contentType: string;
  filename: string;
};

export async function fetchNanoBananaImage(params: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<NanoBananaImage> {
  const { apiKey, model, prompt } = params;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
  });

  const candidates = response.candidates ?? [];
  const parts = candidates[0]?.content?.parts ?? [];

  for (const part of parts) {
    const inlineData = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (!inlineData?.data) continue;

    const contentType = inlineData.mimeType || "image/png";
    const bytes = Uint8Array.from(Buffer.from(inlineData.data, "base64"));
    const ext = contentTypeToExt(contentType);
    return { bytes, contentType, filename: `1fuji2taka3nasubi.${ext}` };
  }

  const text = parts
    .map((p) => (typeof (p as { text?: unknown }).text === "string" ? String((p as { text: string }).text) : ""))
    .filter(Boolean)
    .join("\n");

  throw new Error(`nano banana (gemini) did not return inline image data${text ? `: ${text}` : ""}`);
}
