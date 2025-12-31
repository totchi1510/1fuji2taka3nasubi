import { Buffer } from "node:buffer";

export async function sendDiscordWebhookWithFile(params: {
  webhookUrl: string;
  threadId?: string;
  content: string;
  filename: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<{ messageId?: string; attachmentUrl?: string }> {
  const url = new URL(params.webhookUrl);
  if (params.threadId) url.searchParams.set("thread_id", params.threadId);
  url.searchParams.set("wait", "true");

  const form = new FormData();
  form.set("payload_json", JSON.stringify({ content: params.content }));
  const buffer = Buffer.from(params.bytes);
  form.set("files[0]", new Blob([buffer], { type: params.contentType }), params.filename);

  const res = await fetch(url.toString(), { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`discord webhook failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  const json = (await res.json().catch(() => null)) as unknown;
  const messageId =
    json && typeof json === "object" && typeof (json as { id?: unknown }).id === "string"
      ? ((json as { id: string }).id as string)
      : undefined;
  const attachmentUrl = (() => {
    if (!json || typeof json !== "object") return undefined;
    const attachments = (json as { attachments?: unknown }).attachments;
    if (!Array.isArray(attachments) || attachments.length === 0) return undefined;
    const first = attachments[0] as { url?: unknown };
    return typeof first?.url === "string" ? first.url : undefined;
  })();

  return { messageId, attachmentUrl };
}
