import { neon } from "@neondatabase/serverless";

export type RunRow = {
  id: string;
  created_at: string;
  discord_message_id: string | null;
  image_url: string;
};

async function ensureSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      discord_message_id TEXT,
      image_url TEXT NOT NULL
    );
  `;
}

export async function insertRun(databaseUrl: string, params: { discordMessageId?: string; imageUrl: string }) {
  await ensureSchema(databaseUrl);
  const sql = neon(databaseUrl);
  await sql`
    INSERT INTO runs (discord_message_id, image_url)
    VALUES (${params.discordMessageId ?? null}, ${params.imageUrl});
  `;
}

export async function listRuns(databaseUrl: string, limit: number): Promise<RunRow[]> {
  await ensureSchema(databaseUrl);
  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT id::text, created_at::text, discord_message_id, image_url
    FROM runs
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  return rows as unknown as RunRow[];
}
