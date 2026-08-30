import { useCallback, useEffect, useRef, useState } from "react";
import {
  generatePdf,
  type MinitypeApi,
  preprocessMarkdown,
} from "../libs/create-document";

type Status = "idle" | "loading" | "error";

interface Props {
  /** ドキュメント ID（`entry.slug` を渡す）． */
  docId: string;
  /** PDF のタイトルとして使用する文字列． */
  title?: string;
}

const MT_CACHE_KEY = "__minitype_exports__";
const MT_READY_EVENT = "__minitype_ready__";
const MT_ERROR_EVENT = "__minitype_error__";
const MT_SCRIPT_ID = "__minitype_script__";

/**
 * `crypto.randomUUID` が未実装の環境（iOS Safari 14 以前等）向けのポリフィル．
 */
const polyfillCryptoRandomUUID = () => {
  if (typeof crypto !== "undefined" && !crypto.randomUUID) {
    crypto.randomUUID = () => {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}` as `${string}-${string}-${string}-${string}-${string}`;
    };
  }
};

/**
 * minitype のブラウザビルドを動的に読み込む．
 * `<script type="module">` を挿入して `/minitype/index.browser.js` を import して，モジュールを `window` にキャッシュする．
 * 2 回目以降はキャッシュから即座に返す．
 */
const loadMinitype = (): Promise<Record<string, unknown>> => {
  const g = globalThis as Record<string, unknown>;

  if (g[MT_CACHE_KEY]) {
    return Promise.resolve(g[MT_CACHE_KEY] as Record<string, unknown>);
  }

  return new Promise((resolve, reject) => {
    if (document.getElementById(MT_SCRIPT_ID)) {
      document.addEventListener(
        MT_READY_EVENT,
        () => resolve(g[MT_CACHE_KEY] as Record<string, unknown>),
        { once: true },
      );
      document.addEventListener(
        MT_ERROR_EVENT,
        (e) =>
          reject(new Error((e as CustomEvent<string>).detail ?? "load failed")),
        { once: true },
      );
      return;
    }

    const moduleUrl = "/minitype/index.browser.js";
    const cacheKey = MT_CACHE_KEY;
    const readyEvent = MT_READY_EVENT;
    const errorEvent = MT_ERROR_EVENT;

    const script = document.createElement("script");
    script.id = MT_SCRIPT_ID;
    script.type = "module";
    script.textContent = `
import(${JSON.stringify(moduleUrl)}).then(m => {
  window[${JSON.stringify(cacheKey)}] = m;
  document.dispatchEvent(new Event(${JSON.stringify(readyEvent)}));
}).catch(e => {
  document.dispatchEvent(new CustomEvent(${JSON.stringify(errorEvent)}, { detail: String(e) }));
});`;

    document.addEventListener(
      MT_READY_EVENT,
      () => resolve(g[MT_CACHE_KEY] as Record<string, unknown>),
      { once: true },
    );
    document.addEventListener(
      MT_ERROR_EVENT,
      (e) =>
        reject(new Error((e as CustomEvent<string>).detail ?? "load failed")),
      { once: true },
    );

    document.head.appendChild(script);
  });
};

/**
 * クリックすると現在のドキュメントを PDF として生成し，新しいタブで開くボタン．
 * minitype のブラウザビルドを遅延読み込みし，フォントと Markdown を fetch してクライアントサイドで PDF を生成する．
 * 生成中は「組版中……」と表示して，エラー時はメッセージをボタン下に表示する．
 */
const PdfPreviewButton = ({ docId, title = "" }: Props) => {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (prevUrl.current) {
        URL.revokeObjectURL(prevUrl.current);
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      polyfillCryptoRandomUUID();
      const mt = await loadMinitype();
      const pdfData = await generatePdf(docId, title, mt as MinitypeApi, {
        headerImagePath: "/quick-start/header.jpg",
      });
      const blob = new Blob([pdfData as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
      prevUrl.current = url;
      window.open(url, "_blank");
      setStatus("idle");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setErrorMsg(msg);
      console.error("[PdfPreviewButton]", err);
    }
  }, [docId, title, status]);

  const label =
    status === "loading" ? "組版中……" : "本ドキュメントを PDF で表示";

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        style={{
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 16px",
          cursor: status === "loading" ? "wait" : "pointer",
          borderRadius: 8,
          border: "none",
          background: "var(--sl-color-accent)",
          opacity: status === "loading" ? 0.7 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {label}
      </button>
      {status === "error" && (
        <p
          style={{
            color: "var(--sl-color-red, #e00)",
            marginTop: 8,
            fontSize: "0.85rem",
          }}
        >
          エラー: {errorMsg}
        </p>
      )}
    </div>
  );
};

export default PdfPreviewButton;
