import { KeyboardEvent, useRef } from "react";
import { compatibilityMatrix } from "../../data/compatibility";
import { variants } from "../../data/variants";
import type { SignatureOutput, VariantId } from "../../lib/types";

export function CompatibilityWorkspace({
  currentVariantId,
  onSelectVariant,
  outputs,
}: {
  currentVariantId: VariantId;
  onSelectVariant: (id: VariantId) => void;
  outputs: SignatureOutput[];
  onCopyHtml?: (html: string) => void;
  onDownloadHtml?: () => void;
}) {
  const currentOutput = outputs.find((o) => o.id === currentVariantId) || outputs[0];
  const variantRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (index + 1) % variants.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (index - 1 + variants.length) % variants.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = variants.length - 1;
    }

    if (targetIndex >= 0) {
      const nextVariant = variants[targetIndex];
      onSelectVariant(nextVariant.id);
      const btn = variantRefs.current[nextVariant.id];
      if (btn) btn.focus();
    }
  };

  return (
    <div className="signet-inspector-panel">
      <div className="signet-inspector-panel__header">
        <h2 className="signet-inspector-panel__title">Cross-Inbox Engine</h2>
        <p className="signet-inspector-panel__desc">
          One author identity compiled into client-specific rendering markup.
        </p>
      </div>

      {/* Visual Metaphor: Pipeline */}
      <div className="signet-pipeline">
        <div className="signet-pipeline__label">SOURCE IDENTITY</div>
        <div className="signet-pipeline__arrow">↓</div>
        <div
          className="signet-pipeline__variants"
          role="tablist"
          aria-label="Compatibility target variants"
        >
          {variants.map((variant, index) => {
            const isSelected = currentVariantId === variant.id;
            return (
              <button
                key={variant.id}
                ref={(el) => (variantRefs.current[variant.id] = el)}
                id={`variant-${variant.id}`}
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`signet-pipeline__chip ${
                  isSelected ? "signet-pipeline__chip--active" : ""
                }`}
                onClick={() => onSelectVariant(variant.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {variant.name.replace(" HTML", "")}
              </button>
            );
          })}
        </div>
        <div className="signet-pipeline__arrow">↓</div>
        <div className="signet-pipeline__label">COMPILED PROOF</div>
      </div>

      {/* Selected Target Audit */}
      <div className="signet-target-audit">
        <div className="signet-target-audit__header">
          <div className="signet-target-audit__name">
            {currentOutput.name.toUpperCase()}
          </div>
          <p className="signet-target-audit__desc">{currentOutput.description}</p>
        </div>

        {/* Feature checklist */}
        <div className="signet-target-audit__checks">
          <div className="signet-target-audit__check-title">Engine guarantees:</div>
          <ul className="signet-target-audit__check-list">
            {currentOutput.checks.map((chk, i) => (
              <li key={i} className="signet-target-audit__check-item">
                <span className="signet-check-icon">✓</span>
                <span>{chk}</span>
              </li>
            ))}
          </ul>
        </div>

        {currentOutput.warnings && currentOutput.warnings.length > 0 && (
          <div className="signet-target-audit__warnings">
            <div className="signet-target-audit__warning-title">Compatibility notices:</div>
            <ul>
              {currentOutput.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Research and client compatibility disclosures */}
      <div className="support-details" style={{ marginTop: "24px" }}>
        <details className="signet-disclosure">
          <summary className="signet-disclosure__summary">
            Installation instructions
          </summary>
          <div className="signet-disclosure__content">
            <ol style={{ paddingLeft: "20px", margin: "8px 0" }}>
              {currentOutput.installSteps.map((step, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{step}</li>
              ))}
              <li style={{ marginTop: "6px", color: "var(--text-tertiary)" }}>
                Always send a real sent message test before widespread rollout.
              </li>
            </ol>
          </div>
        </details>

        <details className="signet-disclosure">
          <summary className="signet-disclosure__summary">
            Client support notes
          </summary>
          <div className="signet-disclosure__content">
            <p style={{ margin: "4px 0 8px" }}>{currentOutput.description}</p>
            {currentOutput.warnings.map((w, i) => (
              <p key={i} style={{ margin: "4px 0", color: "var(--text-secondary)" }}>{w}</p>
            ))}
          </div>
        </details>

        <details className="signet-disclosure">
          <summary className="signet-disclosure__summary">
            Raw export source
          </summary>
          <div className="signet-disclosure__content">
            <label htmlFor="export-source-raw" className="sr-only">
              Export source
            </label>
            <textarea
              id="export-source-raw"
              aria-label="Export source"
              readOnly
              value={currentOutput.html || currentOutput.text || ""}
              rows={8}
              className="signet-field__textarea"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                whiteSpace: "pre",
              }}
            />
          </div>
        </details>
      </div>

      {/* 7 client research specifications */}
      <details className="signet-disclosure research" style={{ marginTop: "16px" }}>
        <summary className="signet-disclosure__summary">
          Email client rendering specifications (7 clients)
        </summary>
        <div className="signet-disclosure__content">
          {compatibilityMatrix.map((item) => (
            <details key={item.id} className="signet-client-detail">
              <summary className="signet-client-detail__summary">
                {item.client}
              </summary>
              <div className="signet-client-detail__body">
                <p style={{ fontStyle: "italic", marginBottom: "12px" }}>{item.editor}</p>
                <dl className="signet-spec-grid">
                  <div>
                    <dt>HTML / CSS</dt>
                    <dd>{item.htmlCss.summary}</dd>
                  </div>
                  <div>
                    <dt>Images</dt>
                    <dd>{item.images.summary}</dd>
                  </div>
                  <div>
                    <dt>Dark Mode</dt>
                    <dd>{item.darkMode.summary}</dd>
                  </div>
                  <div>
                    <dt>Media Queries</dt>
                    <dd>{item.mediaQueries.summary}</dd>
                  </div>
                  <div>
                    <dt>Web Fonts</dt>
                    <dd>{item.webFonts.summary}</dd>
                  </div>
                  <div>
                    <dt>SVG</dt>
                    <dd>{item.svg.summary}</dd>
                  </div>
                  <div>
                    <dt>Animated GIF</dt>
                    <dd>{item.animatedGif.summary}</dd>
                  </div>
                  <div>
                    <dt>Tracking</dt>
                    <dd>{item.tracking.summary}</dd>
                  </div>
                  <div>
                    <dt>Mobile View</dt>
                    <dd>{item.mobile.summary}</dd>
                  </div>
                </dl>
                <div style={{ marginTop: "12px" }}>
                  <strong>Citations:</strong>
                  <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                    {item.sources.map((s, idx) => (
                      <li key={idx}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      </details>
    </div>
  );
}
