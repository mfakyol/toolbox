import { useState } from "react";
import { useI18n } from "../i18n";

export function CopyButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button className="ghost-btn slim" onClick={copy} disabled={!text}>
      {copied ? t("tools.copied") : t("tools.copy")}
    </button>
  );
}
