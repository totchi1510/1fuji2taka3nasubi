type NonEmptyString = string & { __brand: "NonEmptyString" };

function asNonEmptyString(value: string | undefined, name: string): NonEmptyString {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value as NonEmptyString;
}

export type AppEnv = {
  cronSecret?: string;
  databaseUrl?: string;
};

export function getOptionalEnv(): AppEnv {
  return {
    cronSecret: process.env.CRON_SECRET?.trim() || undefined,
    databaseUrl: process.env.DATABASE_URL?.trim() || undefined,
  };
}

export type CronEnv = {
  cronSecret?: string;
  discordWebhookUrl: NonEmptyString;
  discordThreadId?: string;
  geminiApiKey: NonEmptyString;
  geminiModel: string;
  nanoBananaPrompt: string;
  databaseUrl?: string;
};

export function getCronEnv(): CronEnv {
  return {
    cronSecret: process.env.CRON_SECRET?.trim() || undefined,
    discordWebhookUrl: asNonEmptyString(process.env.DISCORD_WEBHOOK_URL, "DISCORD_WEBHOOK_URL"),
    discordThreadId: process.env.DISCORD_THREAD_ID?.trim() || undefined,
    geminiApiKey: asNonEmptyString(process.env.GEMINI_API_KEY, "GEMINI_API_KEY"),
    geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-image",
    nanoBananaPrompt:
      process.env.NANO_BANANA_PROMPT?.trim() ||
      "「一富士二鷹三茄子」のイメージを、画像として生成してください。",
    databaseUrl: process.env.DATABASE_URL?.trim() || undefined,
  };
}
