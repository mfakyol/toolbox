import { useState } from "react";
import { useI18n } from "../i18n";
import {
  JsonTool,
  DiffTool,
  Base64Tool,
  UrlTool,
  JwtTool,
  HashTool,
  UuidTool,
} from "../components/DevTools";

const TABS = [
  { id: "json", label: "JSON", El: JsonTool },
  { id: "diff", label: "Diff", El: DiffTool },
  { id: "base64", label: "Base64", El: Base64Tool },
  { id: "url", label: "URL", El: UrlTool },
  { id: "jwt", label: "JWT", El: JwtTool },
  { id: "hash", label: "Hash", El: HashTool },
  { id: "uuid", label: "UUID", El: UuidTool },
] as const;

export default function ToolsPage() {
  const { t } = useI18n();
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("json");
  const Active = TABS.find((tab) => tab.id === active)!.El;

  return (
    <>
      <p className="page-intro">{t("tools.intro")}</p>

      <div className="subnav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`subnav-btn ${active === tab.id ? "active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="panel">
        <Active />
      </section>
    </>
  );
}
