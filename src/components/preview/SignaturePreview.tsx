import { useEffect, useRef, useState } from "react";
import type { SignatureOutput } from "../../lib/types";
import { Button } from "../ui/Button";

export function SignaturePreview({
  currentOutput,
  activeTargetName,
  themeName,
  onCopySignature,
}: {
  currentOutput: SignatureOutput;
  activeTargetName: string;
  themeName: string;
  onCopySignature: () => void;
}) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [inboxSurface, setInboxSurface] = useState<"light" | "dark">("light");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIFrameHeight] = useState<number>(240);

  // Sync iframe content and auto-size height
  useEffect(() => {
    if (!currentOutput.html) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    // Build the isolated email preview document
    const isDark = inboxSurface === "dark";
    const bg = isDark ? "#181B1C" : "#FFFFFF";
    const text = isDark ? "#E5E5E5" : "#111111";

    const wrapperHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 16px 20px 24px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      background: ${bg};
      color: ${text};
      overflow-x: auto;
    }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${currentOutput.html}
</body>
</html>`;

    doc.open();
    doc.write(wrapperHtml);
    doc.close();

    // Auto-measure height
    const updateHeight = () => {
      try {
        if (doc.body) {
          const scroll = doc.body.scrollHeight;
          if (scroll > 40) {
            setIFrameHeight(scroll + 12);
          }
        }
      } catch (err) {
        // ignore cross-frame errors if any
      }
    };

    updateHeight();
    const timer = setTimeout(updateHeight, 150);
    return () => clearTimeout(timer);
  }, [currentOutput.html, inboxSurface, viewport]);

  return (
    <div className="signet-preview-pane">
      {/* Top Preview Toolbar */}
      <div className="signet-preview-toolbar">
        <div className="signet-preview-toolbar__left">
          <span className="signet-preview-toolbar__title">Live Composition Proof</span>
          <span className="signet-preview-toolbar__badge">
            {themeName} · {activeTargetName}
          </span>
        </div>

        <div className="signet-preview-toolbar__right">
          {/* Viewport switch: Desktop vs Mobile */}
          <div className="signet-segmented" role="group" aria-label="Preview viewport size">
            <button
              className={`signet-segmented__btn ${
                viewport === "desktop" ? "signet-segmented__btn--active" : ""
              }`}
              onClick={() => setViewport("desktop")}
              title="Desktop client canvas (full width)"
            >
              Desktop
            </button>
            <button
              className={`signet-segmented__btn ${
                viewport === "mobile" ? "signet-segmented__btn--active" : ""
              }`}
              onClick={() => setViewport("mobile")}
              title="Mobile client canvas (375px)"
            >
              Mobile
            </button>
          </div>

          {/* Inbox Surface simulation */}
          <div className="signet-segmented" role="group" aria-label="Inbox background simulation">
            <button
              className={`signet-segmented__btn ${
                inboxSurface === "light" ? "signet-segmented__btn--active" : ""
              }`}
              onClick={() => setInboxSurface("light")}
              title="Light inbox client background"
            >
              Light
            </button>
            <button
              className={`signet-segmented__btn ${
                inboxSurface === "dark" ? "signet-segmented__btn--active" : ""
              }`}
              onClick={() => setInboxSurface("dark")}
              title="Dark inbox client background"
            >
              Dark
            </button>
          </div>

          <Button
            variant="cobalt"
            size="sm"
            onClick={onCopySignature}
            className="primary"
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Simulated Email Composer Window */}
      <div
        className={`signet-composer ${
          viewport === "mobile" ? "signet-composer--mobile" : ""
        } ${inboxSurface === "dark" ? "signet-composer--dark" : ""}`}
      >
        <div className="signet-composer__header">
          <div className="signet-composer__dots">
            <span className="signet-composer__dot" />
            <span className="signet-composer__dot" />
            <span className="signet-composer__dot" />
          </div>
          <div className="signet-composer__title">New Message</div>
        </div>

        <div className="signet-composer__meta">
          <div className="signet-composer__field">
            <span className="signet-composer__label">To:</span>
            <span className="signet-composer__value">Dana Vance &lt;dana@example.com&gt;</span>
          </div>
          <div className="signet-composer__field">
            <span className="signet-composer__label">Subject:</span>
            <span className="signet-composer__value">Notes from our call & deliverables</span>
          </div>
        </div>

        <div className="signet-composer__body">
          <div className="signet-composer__mock-text">
            <p>Hi Dana,</p>
            <p>
              Sending over the deliverables and documentation from our review. Let me know if you have questions before tomorrow's rollout.
            </p>
            <p>Best,</p>
          </div>

          {/* The signature itself */}
          <div className="signet-composer__signature-slot">
            {currentOutput.html ? (
              <iframe
                ref={iframeRef}
                title="Signature preview"
                sandbox="allow-same-origin"
                style={{
                  width: "100%",
                  height: `${iframeHeight}px`,
                  border: "none",
                  display: "block",
                  overflow: "hidden",
                }}
              />
            ) : (
              <pre
                className="signet-composer__plain-text"
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: inboxSurface === "dark" ? "#E5E5E5" : "#111111",
                  whiteSpace: "pre-wrap",
                }}
              >
                {currentOutput.text}
              </pre>
            )}
          </div>
        </div>
      </div>

      {inboxSurface === "dark" && (
        <div className="signet-simulation-notice">
          Simulation note: Email client dark-mode algorithms invert colors unpredictably. Signet uses neutral-safe inline values to avoid harsh color clipping.
        </div>
      )}
    </div>
  );
}
