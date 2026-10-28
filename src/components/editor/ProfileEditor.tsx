import type { Profile } from "../../lib/types";
import { Field } from "../ui/Field";

export function ProfileEditor({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (updated: Profile) => void;
}) {
  const update = (key: keyof Profile, val: any) => {
    onChange({ ...profile, [key]: val });
  };

  return (
    <div className="signet-inspector-panel">
      <div className="signet-inspector-panel__header">
        <h2 className="signet-inspector-panel__title">Identity</h2>
        <p className="signet-inspector-panel__desc">
          Your primary profile details, title, and organization.
        </p>
      </div>

      <div className="signet-inspector-form">
        <div className="signet-form-grid">
          <Field
            id="fullName"
            label="Full name"
            value={profile.fullName}
            onChange={(v) => update("fullName", v)}
            placeholder="Sifat Bhatia"
            autoComplete="name"
          />
          <Field
            id="pronouns"
            label="Pronouns"
            value={profile.pronouns || ""}
            onChange={(v) => update("pronouns", v)}
            placeholder="they/them, he/him, she/her"
          />
        </div>

        <div className="signet-form-grid">
          <Field
            id="title"
            label="Job title"
            value={profile.title}
            onChange={(v) => update("title", v)}
            placeholder="Design Engineer"
          />
          <Field
            id="company"
            label="Company"
            value={profile.company}
            onChange={(v) => update("company", v)}
            placeholder="Studio / Agency / Company"
          />
        </div>

        <Field
          id="tagline"
          label="Tagline / brief statement"
          value={profile.tagline || ""}
          onChange={(v) => update("tagline", v)}
          placeholder="Frontend and fullstack web experiences that feel clean and modern."
          rows={2}
        />

        <details className="signet-disclosure" open>
          <summary className="signet-disclosure__summary">
            Photo, logo & footer
          </summary>
          <div className="signet-disclosure__content">
            <Field
              id="avatarUrl"
              label="Avatar / photo URL"
              value={profile.avatarUrl || ""}
              onChange={(v) => update("avatarUrl", v)}
              placeholder="https://example.com/avatar.png"
              hint="Must be a public HTTPS URL. PNG or JPG format."
            />
            <Field
              id="logoUrl"
              label="Company logo URL"
              value={profile.logoUrl || ""}
              onChange={(v) => update("logoUrl", v)}
              placeholder="https://example.com/logo.png"
              hint="PNG or JPG recommended for email compatibility."
            />
            <Field
              id="disclaimer"
              label="Footer / environmental note"
              value={profile.disclaimer || ""}
              onChange={(v) => update("disclaimer", v)}
              placeholder="Please consider the environment before printing this email."
              rows={2}
            />
          </div>
        </details>
      </div>
    </div>
  );
}
