import { useCallback, useEffect, useRef, useState } from "react";
import { generatePdf, type MinitypeApi } from "../libs/create-document";

type Status = "idle" | "loading" | "error";

interface Props {
  docId: string;
  title?: string;
}

const MT_CACHE_KEY = "__minitype_exports__";
const MT_READY_EVENT = "__minitype_ready__";
const MT_ERROR_EVENT = "__minitype_error__";
const MT_SCRIPT_ID = "__minitype_script__";

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

export default function PdfPreviewButton({ docId, title = "" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
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
}
