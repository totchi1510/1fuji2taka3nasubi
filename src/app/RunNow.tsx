"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CronResult =
  | { ok: true; nanoOk: boolean; discordOk: boolean; discordMessageId?: string; imageUrl?: string }
  | { ok: false; error?: string };

export function RunNowButton(props: { className?: string }) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("cron_secret");
      if (saved) setToken(saved);
    } catch {
      // ignore
    }
  }, []);

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (token.trim()) h.Authorization = `Bearer ${token.trim()}`;
    return h;
  }, [token]);

  async function run() {
    setIsRunning(true);
    setStatus(null);
    setNeedsAuth(false);

    try {
      const res = await fetch("/api/cron", { method: "GET", headers });
      if (res.status === 401) {
        setNeedsAuth(true);
        setStatus("CRON_SECRET が必要です（入力して実行してください）");
        return;
      }

      const json = (await res.json().catch(() => null)) as CronResult | null;
      if (!res.ok || !json) {
        const text = await res.text().catch(() => "");
        setStatus(`失敗: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
        return;
      }

      if (!json.ok) {
        setStatus(`失敗: ${json.error ?? "unknown error"}`);
        return;
      }

      if (json.imageUrl) {
        setStatus("生成しました（ギャラリー更新中）");
      } else {
        setStatus("実行しました（ギャラリー更新中）");
      }

      router.refresh();
    } catch (e) {
      setStatus(`失敗: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsRunning(false);
    }
  }

  function saveToken() {
    try {
      sessionStorage.setItem("cron_secret", token.trim());
      setStatus("CRON_SECRET を保存しました（このブラウザのみ）");
    } catch {
      setStatus("保存できませんでした");
    }
  }

  return (
    <div className={props.className}>
      <button type="button" onClick={run} disabled={isRunning} aria-busy={isRunning}>
        {isRunning ? "Running…" : "Run now"}
      </button>

      {(needsAuth || token.trim().length > 0) && (
        <div>
          <label>
            CRON_SECRET
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="paste token"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <button type="button" onClick={saveToken} disabled={!token.trim()}>
            Save
          </button>
        </div>
      )}

      {status && <div role="status">{status}</div>}
    </div>
  );
}

