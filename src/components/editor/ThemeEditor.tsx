import { KeyboardEvent, useRef } from "react";
import { themes } from "../../data/themes";
import type { Profile, ThemeId } from "../../lib/types";
import { ThemeCardPreview } from "./ThemeCardPreview";

export function ThemeEditor({
  currentThemeId,
  onSelectTheme,
  profile,
}: {
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  profile: Profile;
}) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (index + 1) % themes.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (index - 1 + themes.length) % themes.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = themes.length - 1;
    }

    if (targetIndex >= 0) {
      const nextTheme = themes[targetIndex];
      onSelectTheme(nextTheme.id);
      const btn = buttonRefs.current[nextTheme.id];
      if (btn) btn.focus();
    }
  };

  return (
    <div className="signet-inspector-panel">
      <div className="signet-inspector-panel__header">
        <h2 className="signet-inspector-panel__title">Curated Themes</h2>
        <p className="signet-inspector-panel__desc">
          Five editorial compositions. Same underlying identity and contact data, rendered with distinct typography and tonal hierarchy.
        </p>
      </div>

      <div
        className="signet-theme-gallery"
        role="radiogroup"
        aria-label="Theme selection"
      >
        {themes.map((theme, index) => {
          const isSelected = currentThemeId === theme.id;
          return (
            <button
              key={theme.id}
              ref={(el) => (buttonRefs.current[theme.id] = el)}
              id={`theme-${theme.id}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`signet-theme-card ${
                isSelected ? "signet-theme-card--selected" : ""
              }`}
              onClick={() => onSelectTheme(theme.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <div className="signet-theme-card__header">
                <div className="signet-theme-card__title-row">
                  <span className="signet-theme-card__name">{theme.name}</span>
                  {isSelected && (
                    <span className="signet-theme-card__badge">Active</span>
                  )}
                </div>
                <p className="signet-theme-card__desc">{theme.description}</p>
              </div>

              <div className="signet-theme-card__preview">
                <ThemeCardPreview
                  theme={theme}
                  profile={profile}
                  isSelected={isSelected}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
