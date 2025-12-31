import { NextRequest, NextResponse } from "next/server";

import { getOptionalEnv } from "@/lib/env";
import { listRuns } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const env = getOptionalEnv();
  if (!env.databaseUrl) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not set" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const limitRaw = searchParams.get("limit") || "24";
  const limit = Math.max(1, Math.min(200, Number.parseInt(limitRaw, 10) || 24));

  const runs = await listRuns(env.databaseUrl, limit);
  return NextResponse.json({ ok: true, runs });
}
