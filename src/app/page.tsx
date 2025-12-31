import { listRuns } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";

import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const env = getOptionalEnv();
  const runsPromise = env.databaseUrl ? listRuns(env.databaseUrl, 24) : Promise.resolve([]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>一富士二鷹三茄子 Cron Bot</h1>
          <p>
            Vercel Cron が 1時間ごとに <code>/api/cron</code> を実行し、nano banana（Gemini）で生成した画像を Discord
            のスレッドへ投稿します。
          </p>
        </div>

        <div className={styles.ctas}>
          <a className={styles.primary} href="/api/cron">
            Run /api/cron
          </a>
          <a className={styles.secondary} href="/api/runs">
            Runs JSON
          </a>
        </div>

        <Gallery runsPromise={runsPromise} databaseEnabled={Boolean(env.databaseUrl)} />
      </main>
    </div>
  );
}

async function Gallery(props: {
  runsPromise: ReturnType<typeof listRuns> | Promise<never[]>;
  databaseEnabled: boolean;
}) {
  if (!props.databaseEnabled) {
    return (
      <section className={styles.gallery} aria-label="Gallery">
        <div className={styles.card}>
          <div className={styles.meta}>
            <div className={styles.time}>ギャラリー表示には `DATABASE_URL` が必要です</div>
          </div>
        </div>
      </section>
    );
  }

  const runs = await props.runsPromise;
  if (runs.length === 0) {
    return (
      <section className={styles.gallery} aria-label="Gallery">
        <div className={styles.card}>
          <div className={styles.meta}>
            <div className={styles.time}>まだ画像がありません（`/api/cron` を実行してください）</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.gallery} aria-label="Gallery">
      {runs.map((run) => {
        const date = new Date(run.created_at);
        const time = Number.isNaN(date.getTime()) ? run.created_at : date.toLocaleString();

        return (
          <article className={styles.card} key={run.id}>
            <div className={styles.thumbWrap}>
              <Image
                className={styles.thumb}
                src={run.image_url}
                alt="一富士二鷹三茄子"
                fill
                sizes="(max-width: 600px) 50vw, 33vw"
                priority={false}
              />
            </div>
            <div className={styles.meta}>
              <div className={styles.time}>{time}</div>
              <a className={styles.smallLink} href={run.image_url} target="_blank" rel="noreferrer">
                Open image
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}
