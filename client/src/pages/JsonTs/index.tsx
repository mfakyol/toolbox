import { useMemo, useState } from "react";
import { jsonToTypescript, type DeclStyle } from "@/utils/jsonToTs";
import { useI18n } from "@/i18n";
import { Panel, Field, Button, Alert, PageIntro, CodeEditor } from "@/components/ui";
import styles from "./styles.module.scss";

const SAMPLE = JSON.stringify(
  {
    id: 1,
    name: "Ada",
    email: "ada@example.com",
    isActive: true,
    roles: ["admin", "user"],
    profile: { age: 36, city: "London", verifiedAt: null },
    posts: [
      { id: 10, title: "Hello", tags: ["intro"] },
      { id: 11, title: "World", tags: ["news"], pinned: true },
    ],
  },
  null,
  2
);

export default function JsonTsPage() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [style, setStyle] = useState<DeclStyle>("interface");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      return {
        output: jsonToTypescript(input, { rootName, style }),
        error: null,
      };
    } catch (err) {
      return { output: "", error: (err as Error).message };
    }
  }, [input, rootName, style]);

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    if (!output) return;
    const blob = new Blob([output + "\n"], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rootName || "types"}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageIntro>{t("json.intro")}</PageIntro>

      <div className={styles.options}>
        <Field label={t("json.rootName")} inline>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            spellCheck={false}
          />
        </Field>
        <Field label={t("json.style")} inline>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as DeclStyle)}
          >
            <option value="interface">interface</option>
            <option value="type">type</option>
          </select>
        </Field>
        <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)}>
          {t("json.sample")}
        </Button>
      </div>

      <div className={styles.layout}>
        <Panel className={styles.panel}>
          <div className={styles.head}>
            <span>{t("json.input")}</span>
          </div>
          <div className={styles.editorWrap}>
            <CodeEditor
              value={input}
              language="json"
              onChange={setInput}
              placeholder={t("json.placeholder")}
            />
          </div>
          {error && <Alert>⚠️ {error}</Alert>}
        </Panel>

        <Panel className={styles.panel}>
          <div className={styles.head}>
            <span>{t("json.output")}</span>
            {output && (
              <div className={styles.headActions}>
                <Button variant="ghost" size="sm" onClick={copy}>
                  {copied ? t("json.copied") : t("json.copy")}
                </Button>
                <Button variant="ghost" size="sm" onClick={download}>
                  {t("json.download")}
                </Button>
              </div>
            )}
          </div>
          {output ? (
            <div className={styles.editorWrap}>
              <CodeEditor value={output} language="typescript" readOnly />
            </div>
          ) : (
            <div className={styles.empty}>{t("json.empty")}</div>
          )}
        </Panel>
      </div>
    </>
  );
}
