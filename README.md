1時間ごとに「nano banana（Gemini 画像生成）」へリクエストを送り、生成された「一富士二鷹三茄子」画像を Discord のスレッドへ投稿する Next.js アプリです（Vercel Cron 対応）。

## 構成

- `GET /api/cron`: 画像生成 → Discord 投稿（Vercel Cron から1時間ごとに叩く）
- `GET /api/runs`: 生成履歴の JSON（`DATABASE_URL` がある場合）
  - Vercel Hobby の Cron は「1日1回」制限があるため、毎時実行したい場合は外部スケジューラを使います（下記）。

## 環境変数
`.env.example` を参照してください。

必須:
- `DISCORD_WEBHOOK_URL`: Discord の Webhook URL
- `GEMINI_API_KEY`: Gemini API Key（`@google/genai` 用）

任意:
- `DISCORD_THREAD_ID`: 既存スレッドへ投稿したい場合の thread id（未設定なら通常投稿）
- `GEMINI_MODEL`: 画像生成できるモデル（デフォルト: `gemini-2.5-flash-image`）
- `NANO_BANANA_PROMPT`: プロンプト上書き（未設定なら「一富士二鷹三茄子」固定）
- `CRON_SECRET`: 設定した場合、`/api/cron` は `Authorization: Bearer <CRON_SECRET>` が必須
- `DATABASE_URL`: 生成履歴（画像URL + 時刻）を保存してトップでギャラリー表示

## nano banana（Gemini）の返り
`@google/genai` の `generateContent` で返る `inlineData`（base64）から画像を取り出して Discord に添付します。

## ローカル実行

```bash
npm install
npm run dev
```

`CRON_SECRET` を設定している場合（推奨）、手動実行は以下のように叩けます。

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron
```

## Vercel
- Vercel にデプロイして環境変数を設定してください

## 毎時実行（Vercel Hobby 回避）
おすすめは GitHub Actions のスケジュールで `/api/cron` を叩く方法です。

- 追加済み: `.github/workflows/hourly-cron.yml`（UTC基準で `0 * * * *`）
- GitHub のリポジトリ設定で Secrets を追加
  - `CRON_URL`: `https://<your-app>.vercel.app/api/cron`
  - `CRON_SECRET`: `CRON_SECRET` を設定している場合のみ（推奨）
