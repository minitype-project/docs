import { useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";

const INSTALL_CMD = "npm i @minitype/minitype";

export default function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          color: "#fff",
          fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
          fontFamily: "Noto Sans Mono",
          background: "#222",
          borderRadius: 12,
          padding: "12px 12px 12px 20px",
        }}
      >
        <span
          style={{
            color: "hsl(var(--brand-hue), 50%, 50%)",
            userSelect: "none",
            marginRight: 12,
          }}
        >
          $
        </span>
        <code
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
          }}
        >
          {INSTALL_CMD}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="コマンドをコピー"
          style={{
            background: "none",
            border: "none",
            borderRadius: 6,
            marginLeft: 4,
            padding: "2px 10px",
            fontSize: "0.8rem",
            cursor: "pointer",
            color: copied ? "#22c55e" : "#888",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? <MdCheck size={18} /> : <MdContentCopy size={18} />}
        </button>
      </div>
    </div>
  );
}
