import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "../i18n";
import { Panel, Field, PageIntro, LinkButton } from "../components/ui";
import styles from "./QrPage.module.scss";

type Ecc = "L" | "M" | "Q" | "H";

// Error-correction levels: how much of the code can be damaged/obscured and
// still scan. Higher = more redundancy (denser code, shorter max capacity).
const ECC_LEVELS: { id: Ecc; pct: string }[] = [
  { id: "L", pct: "~7%" },
  { id: "M", pct: "~15%" },
  { id: "Q", pct: "~25%" },
  { id: "H", pct: "~30%" },
];

export default function QrPage() {
  const { t } = useI18n();

  const [text, setText] = useState("https://toolbox.fatihakyol.com");
  const [ecc, setEcc] = useState<Ecc>("M");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview (SVG) — resolution-independent, so it does NOT depend on `size`.
  // Moving the size slider only changes the exported PNG, not the preview.
  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setSvg(null);
      setError(null);
      return;
    }
    let cancelled = false;
    QRCode.toString(value, {
      errorCorrectionLevel: ecc,
      margin,
      color: { dark: fg, light: bg },
      type: "svg",
    })
      .then((svgStr) => {
        if (cancelled) return;
        setSvg(svgStr);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setSvg(null);
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [text, ecc, margin, fg, bg]);

  // PNG export — the only thing `size` affects (output resolution).
  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setPngUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: ecc,
      margin,
      width: size,
      color: { dark: fg, light: bg },
    })
      .then((url) => {
        if (!cancelled) setPngUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPngUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [text, ecc, size, margin, fg, bg]);

  // Downloadable SVG blob URL (revoked when it changes / unmounts).
  const svgUrl = useMemo(() => {
    if (!svg) return null;
    return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  }, [svg]);
  useEffect(() => {
    return () => {
      if (svgUrl) URL.revokeObjectURL(svgUrl);
    };
  }, [svgUrl]);

  return (
    <div>
      <PageIntro>{t("qr.intro")}</PageIntro>

      <div className={styles.layout}>
        {/* Controls */}
        <Panel className={styles.controls}>
          <Field label={t("qr.content")}>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("qr.contentPlaceholder")}
            />
          </Field>

          <Field label={t("qr.ecc")}>
            <select value={ecc} onChange={(e) => setEcc(e.target.value as Ecc)}>
              {ECC_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {t(`qr.ecc${level.id}`)} · {level.pct}
                </option>
              ))}
            </select>
          </Field>
          <p className={styles.hint}>{t("qr.eccHint")}</p>

          <div className={styles.row}>
            <Field label={`${t("qr.size")} (${size}px)`}>
              <input
                type="range"
                min={128}
                max={1024}
                step={16}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </Field>
            <Field label={t("qr.margin")}>
              <input
                type="number"
                min={0}
                max={16}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className={styles.row}>
            <Field label={t("qr.fg")}>
              <input
                type="color"
                className={styles.color}
                value={fg}
                onChange={(e) => setFg(e.target.value)}
              />
            </Field>
            <Field label={t("qr.bg")}>
              <input
                type="color"
                className={styles.color}
                value={bg}
                onChange={(e) => setBg(e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        {/* Preview + export */}
        <Panel className={styles.result}>
          {error ? (
            <p className={styles.error}>{t("qr.tooLong")}</p>
          ) : svg ? (
            <>
              <div
                className={styles.preview}
                style={{ background: bg }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <div className={styles.downloads}>
                {pngUrl && (
                  <LinkButton variant="success" block href={pngUrl} download="qr.png">
                    {t("qr.downloadPng")}
                  </LinkButton>
                )}
                {svgUrl && (
                  <LinkButton variant="success" block href={svgUrl} download="qr.svg">
                    {t("qr.downloadSvg")}
                  </LinkButton>
                )}
              </div>
            </>
          ) : (
            <p className={styles.placeholder}>{t("qr.empty")}</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
