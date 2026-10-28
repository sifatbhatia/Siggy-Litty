import { SignetLogo } from "../brand/SignetLogo";
import { Button } from "../ui/Button";

export function AppHeader({
  activeTargetName,
  mode,
  onToggleMode,
  onCopySignature,
  onExportClick,
  copyStatus,
}: {
  activeTargetName: string;
  mode: "day" | "night";
  onToggleMode: () => void;
  onCopySignature: () => void;
  onExportClick: () => void;
  copyStatus: string;
}) {
  return (
    <header className="signet-header">
      <div className="signet-header__inner">
        <div className="signet-header__left">
          <a href="#" className="signet-header__brand-link" aria-label="Signet home">
            <SignetLogo size={22} />
          </a>
          <span className="signet-header__divider" aria-hidden="true" />
          <p className="signet-header__tagline">
            One identity. Every inbox.
          </p>
        </div>

        <div className="signet-header__right">
          <div className="signet-header__target-badge" title="Active rendering target">
            <span className="signet-header__target-dot" />
            <span className="signet-header__target-text">{activeTargetName}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleMode}
            aria-label={
              mode === "night"
                ? "Switch to light appearance"
                : "Switch to dark appearance"
            }
          >
            {mode === "night" ? "Light" : "Dark"}
          </Button>

          <Button
            variant="cobalt"
            size="sm"
            onClick={onCopySignature}
            className="primary"
          >
            Copy signature
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onExportClick}
          >
            Export HTML
          </Button>
        </div>
      </div>
      {copyStatus && (
        <div role="status" aria-live="polite" className="signet-header__status-bar">
          {copyStatus}
        </div>
      )}
    </header>
  );
}
