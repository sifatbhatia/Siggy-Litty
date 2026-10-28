export function DesignEditor() {
  return (
    <div className="signet-inspector-panel">
      <div className="signet-inspector-panel__header">
        <h2 className="signet-inspector-panel__title">Design & Geometry</h2>
        <p className="signet-inspector-panel__desc">
          Refined proportions and email-safe typographic controls.
        </p>
      </div>

      <div className="signet-inspector-form">
        <div className="signet-design-spec-card">
          <div className="signet-design-spec-card__label">Typographic System</div>
          <div className="signet-design-spec-card__val">
            Email-safe system stacks: Segoe UI, Georgia, Avenir Next, Tahoma, Arial.
          </div>
          <p className="signet-design-spec-card__note">
            External web fonts fail silently in Outlook desktop and Gmail mobile. Signet uses calibrated system typography to guarantee cross-client stability.
          </p>
        </div>

        <div className="signet-design-spec-card">
          <div className="signet-design-spec-card__label">Layout Architecture</div>
          <div className="signet-design-spec-card__val">
            Strict Presentation Tables (MSO-compliant)
          </div>
          <p className="signet-design-spec-card__note">
            Two-column avatar/details split structure with top-aligned cells and explicit pixel boundaries.
          </p>
        </div>

        <div className="signet-design-spec-card">
          <div className="signet-design-spec-card__label">Asset Sizing</div>
          <div className="signet-design-spec-card__val">
            Retina 2x Dimensions (64px display / 128px source)
          </div>
          <p className="signet-design-spec-card__note">
            Images include explicit HTML width/height attributes to prevent layout jumping while clients load remote assets.
          </p>
        </div>
      </div>
    </div>
  );
}
