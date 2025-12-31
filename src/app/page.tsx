import Image from "next/image";

import { listRuns } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";

import { RunNowButton } from "./RunNow";
import styles from "./page.module.css";

export default function Home() {
  const env = getOptionalEnv();
  const runsPromise = env.databaseUrl ? listRuns(env.databaseUrl, 24) : Promise.resolve([]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.intro}>
          <div className={styles.titleBlock}>
            <h1>一富士二鷹三茄子</h1>
            <p>
              Vercel Cron が <code>/api/cron</code> を1時間ごとに実行し、Gemini で生成した画像を Discord のスレッドへ投稿します。
            </p>
          </div>

          <nav className={styles.ctas} aria-label="Actions">
            <RunNowButton className={styles.runNow} />
            <a className={styles.secondary} href="/api/runs" target="_blank" rel="noreferrer">
              Runs JSON
            </a>
          </nav>
        </header>

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
      <>
        <div className={styles.sectionTitle}>
          <h2>Collection</h2>
          <span>`DATABASE_URL` を設定すると表示できます</span>
        </div>
        <div className={styles.empty}>履歴を保存してコレクション表示するには `DATABASE_URL`（Neon/Postgres）を設定してください。</div>
      </>
    );
  }

  const runs = await props.runsPromise;

  return (
    <>
      <div className={styles.sectionTitle}>
        <h2>Collection</h2>
        <span>{runs.length} items</span>
      </div>

      {runs.length === 0 ? (
        <div className={styles.empty}>まだ画像がありません。まずは `/api/cron` を実行してください。</div>
      ) : (
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
                    sizes="(max-width: 900px) 50vw, 33vw"
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
      )}
    </>
  );
}
