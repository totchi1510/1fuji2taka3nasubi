import { NextRequest, NextResponse } from "next/server";

import { sendDiscordWebhookWithFile } from "@/lib/discord";
import { insertRun } from "@/lib/db";
import { getCronEnv } from "@/lib/env";
import { fetchNanoBananaImage } from "@/lib/nanoBanana";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest, cronSecret?: string): boolean {
  if (!cronSecret) return true;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  let nanoOk = false;
  let discordOk = false;
  let discordMessageId: string | undefined;
  let imageUrl: string | undefined;
  let error: string | undefined;

  try {
    const env = getCronEnv();
    if (!isAuthorized(req, env.cronSecret)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const image = await fetchNanoBananaImage({
      apiKey: env.geminiApiKey,
      model: env.geminiModel,
      prompt: env.nanoBananaPrompt,
    });
    nanoOk = true;

    const sent = await sendDiscordWebhookWithFile({
      webhookUrl: env.discordWebhookUrl,
      threadId: env.discordThreadId,
      content: "一富士二鷹三茄子",
      filename: image.filename,
      bytes: image.bytes,
      contentType: image.contentType,
    });
    discordMessageId = sent.messageId;
    imageUrl = sent.attachmentUrl;
    discordOk = true;

    if (env.databaseUrl && imageUrl) {
      await insertRun(env.databaseUrl, { discordMessageId, imageUrl });
    }

    return NextResponse.json({ ok: true, nanoOk, discordOk, discordMessageId, imageUrl });
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);

    return NextResponse.json({ ok: false, nanoOk, discordOk, discordMessageId, imageUrl, error }, { status: 500 });
  }
}
