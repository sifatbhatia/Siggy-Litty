import { useState } from "react";
import { variants } from "../../data/variants";
import type { SignatureOutput, VariantId } from "../../lib/types";
import { Button } from "../ui/Button";

export function ExportPanel({
  currentVariantId,
  onSelectVariant,
  outputs,
  onCopySignature,
  onCopyPlainText,
  onDownloadHtml,
  onDownloadText,
  onDownloadBundle,
}: {
  currentVariantId: VariantId;
  onSelectVariant: (id: VariantId) => void;
  outputs: SignatureOutput[];
  onCopySignature: () => void;
  onCopyPlainText: () => void;
  onDownloadHtml: () => void;
  onDownloadText: () => void;
  onDownloadBundle: () => void;
}) {
  const [inspectTab, setInspectTab] = useState<"html" | "text">("html");
  const currentOutput = outputs.find((o) => o.id === currentVariantId) || outputs[0];

  const codeContent =
    inspectTab === "html"
      ? currentOutput.html || currentOutput.text || ""
      : currentOutput.text || "";

  const lines = codeContent.split("\n");

  return (
    <div className="signet-inspector-panel">
      <div className="signet-inspector-panel__header">
        <h2 className="signet-inspector-panel__title">Export & Inspection</h2>
        <p className="signet-inspector-panel__desc">
          Generate strict, email-safe markup compiled for your target client.
        </p>
      </div>

      {/* Target Selector */}
      <div className="signet-export-targets">
        <div className="signet-export-targets__label">Target Client Engine</div>
        <div className="signet-export-targets__row">
          {variants.map((v) => {
            const isSelected = currentVariantId === v.id;
            return (
              <button
                key={v.id}
                id={`variant-${v.id}`}
                className={`signet-export-target-pill ${
                  isSelected ? "signet-export-target-pill--active" : ""
                }`}
                onClick={() => onSelectVariant(v.id)}
              >
                {v.name.replace(" HTML", "")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="signet-export-actions">
        {currentVariantId === "plain-text" ? (
          <Button
            variant="cobalt"
            size="lg"
            onClick={onCopyPlainText}
            className="primary"
          >
            Copy plain text
          </Button>
        ) : (
          <Button
            variant="cobalt"
            size="lg"
            onClick={onCopySignature}
            className="primary"
          >
            Copy signature
          </Button>
        )}

        {currentVariantId !== "plain-text" && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onCopyPlainText}
          >
            Copy plain text
          </Button>
        )}
      </div>

      <div className="signet-export-downloads">
        {currentOutput.html ? (
          <Button variant="secondary" size="sm" onClick={onDownloadHtml}>
            Download HTML
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onDownloadText}>
            Download text
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onDownloadBundle}>
          Download bundle
        </Button>
      </div>

      {/* Code Inspector Canvas (matching section 06 of identity board) */}
      <div className="signet-code-canvas">
        <div className="signet-code-canvas__bar">
          <div className="signet-code-canvas__tabs">
            {currentOutput.html && (
              <button
                className={`signet-code-canvas__tab ${
                  inspectTab === "html" ? "signet-code-canvas__tab--active" : ""
                }`}
                onClick={() => setInspectTab("html")}
              >
                HTML Output ({currentOutput.name.replace(" HTML", "")})
              </button>
            )}
            <button
              className={`signet-code-canvas__tab ${
                inspectTab === "text" || !currentOutput.html
                  ? "signet-code-canvas__tab--active"
                  : ""
              }`}
              onClick={() => setInspectTab("text")}
            >
              Plain Text
            </button>
          </div>

          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              if (inspectTab === "html" && currentOutput.html) {
                navigator.clipboard.writeText(currentOutput.html);
              } else {
                navigator.clipboard.writeText(currentOutput.text || "");
              }
            }}
            style={{ color: "#FCFAF6", borderColor: "rgba(255,255,255,0.2)" }}
          >
            Copy code
          </Button>
        </div>

        <div className="signet-code-canvas__editor">
          <pre className="signet-code-canvas__pre">
            <code>
              {lines.slice(0, 50).map((line, idx) => (
                <div key={idx} className="signet-code-canvas__line">
                  <span className="signet-code-canvas__num">{idx + 1}</span>
                  <span className="signet-code-canvas__text">{line}</span>
                </div>
              ))}
              {lines.length > 50 && (
                <div className="signet-code-canvas__line" style={{ opacity: 0.5 }}>
                  <span className="signet-code-canvas__num">...</span>
                  <span className="signet-code-canvas__text">
                    {`(${lines.length - 50} more lines compiled)`}
                  </span>
                </div>
              )}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
