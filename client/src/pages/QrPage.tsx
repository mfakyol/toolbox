import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "../i18n";

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

  // Regenerate PNG + SVG whenever any option changes.
  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setPngUrl(null);
      setSvg(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const opts = {
      errorCorrectionLevel: ecc,
      margin,
      width: size,
      color: { dark: fg, light: bg },
    };

    Promise.all([
      QRCode.toDataURL(value, opts),
      QRCode.toString(value, { ...opts, type: "svg" }),
    ])
      .then(([dataUrl, svgStr]) => {
        if (cancelled) return;
        setPngUrl(dataUrl);
        setSvg(svgStr);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setPngUrl(null);
        setSvg(null);
        setError(err instanceof Error ? err.message : String(err));
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
      <p className="page-intro">{t("qr.intro")}</p>

      <div className="qr-layout">
        {/* Controls */}
        <div className="panel">
          <label className="field">
            <span>{t("qr.content")}</span>
            <textarea
              className="qr-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("qr.contentPlaceholder")}
            />
          </label>

          <label className="field">
            <span>{t("qr.ecc")}</span>
            <select value={ecc} onChange={(e) => setEcc(e.target.value as Ecc)}>
              {ECC_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {t(`qr.ecc${level.id}`)} · {level.pct}
                </option>
              ))}
            </select>
          </label>
          <p className="qr-hint">{t("qr.eccHint")}</p>

          <div className="field row">
            <label>
              <span>
                {t("qr.size")} ({size}px)
              </span>
              <input
                type="range"
                min={128}
                max={1024}
                step={16}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
            <label>
              <span>{t("qr.margin")}</span>
              <input
                type="number"
                min={0}
                max={16}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="field row">
            <label>
              <span>{t("qr.fg")}</span>
              <input
                type="color"
                className="qr-color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
              />
            </label>
            <label>
              <span>{t("qr.bg")}</span>
              <input
                type="color"
                className="qr-color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Preview + export */}
        <div className="panel qr-result">
          {error ? (
            <p className="qr-error">{t("qr.tooLong")}</p>
          ) : pngUrl ? (
            <>
              <div className="qr-preview" style={{ background: bg }}>
                <img src={pngUrl} alt="QR" />
              </div>
              <div className="qr-downloads">
                <a className="download-btn" href={pngUrl} download="qr.png">
                  {t("qr.downloadPng")}
                </a>
                {svgUrl && (
                  <a className="download-btn" href={svgUrl} download="qr.svg">
                    {t("qr.downloadSvg")}
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="qr-placeholder">{t("qr.empty")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
