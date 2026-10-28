import type { Profile } from "../../lib/types";
import { Button } from "../ui/Button";

export function LinksEditor({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (updated: Profile) => void;
}) {
  const links = profile.socialLinks || [];

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const next = [...links];
    next[index] = { ...next[index], [field]: value };
    onChange({ ...profile, socialLinks: next });
  };

  const addLink = () => {
    onChange({
      ...profile,
      socialLinks: [...links, { label: "Link", url: "https://" }],
    });
  };

  const removeLink = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    onChange({ ...profile, socialLinks: next });
  };

  return (
    <div className="signet-inspector-panel">
      <div className="signet-inspector-panel__header">
        <h2 className="signet-inspector-panel__title">External Links</h2>
        <p className="signet-inspector-panel__desc">
          Portfolio, brand, work showcase, and social destinations. Styled as clean, typographic inline links.
        </p>
      </div>

      <div className="signet-inspector-form">
        <div className="signet-links-list">
          {links.map((link, index) => {
            const num = index + 1;
            return (
              <div key={index} className="signet-link-row">
                <div className="signet-link-row__index">#{num}</div>
                <div className="signet-link-row__fields">
                  <div className="signet-field">
                    <label
                      htmlFor={`link-${num}-label`}
                      className="signet-field__label"
                    >
                      {`Link ${num} label`}
                    </label>
                    <input
                      id={`link-${num}-label`}
                      aria-label={`Link ${num} label`}
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(index, "label", e.target.value)}
                      placeholder="e.g. Portfolio"
                      className="signet-field__input"
                    />
                  </div>
                  <div className="signet-field">
                    <label
                      htmlFor={`link-${num}-url`}
                      className="signet-field__label"
                    >
                      {`Link ${num} URL`}
                    </label>
                    <input
                      id={`link-${num}-url`}
                      aria-label={`Link ${num} URL`}
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      placeholder="https://..."
                      className="signet-field__input"
                    />
                  </div>
                </div>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => removeLink(index)}
                  aria-label={`Remove link ${num}`}
                  title={`Remove link ${num}`}
                  className="signet-link-row__remove"
                >
                  ✕
                </Button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "16px" }}>
          <Button
            variant="secondary"
            size="md"
            onClick={addLink}
            aria-label="＋ Add link"
          >
            ＋ Add link
          </Button>
        </div>
      </div>
    </div>
  );
}
