import type { Profile } from "../../lib/types";
import { Field } from "../ui/Field";

export function ContactEditor({
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
        <h2 className="signet-inspector-panel__title">Contact & Location</h2>
        <p className="signet-inspector-panel__desc">
          Direct channels, booking links, and physical or regional presence.
        </p>
      </div>

      <div className="signet-inspector-form">
        <div className="signet-form-grid">
          <Field
            id="email"
            type="email"
            label="Email address"
            value={profile.email}
            onChange={(v) => update("email", v)}
            placeholder="hello@example.com"
            autoComplete="email"
          />
          <Field
            id="phone"
            type="tel"
            label="Phone number"
            value={profile.phone || ""}
            onChange={(v) => update("phone", v)}
            placeholder="+1 310 555 0100"
            autoComplete="tel"
          />
        </div>

        <div className="signet-form-grid">
          <Field
            id="website"
            type="url"
            label="Website"
            value={profile.website || ""}
            onChange={(v) => update("website", v)}
            placeholder="https://example.com"
          />
          <Field
            id="calendlyUrl"
            type="url"
            label="Booking link (Calendly / Cal.com)"
            value={profile.calendlyUrl || ""}
            onChange={(v) => update("calendlyUrl", v)}
            placeholder="https://cal.com/username"
          />
        </div>

        <div className="signet-form-grid">
          <Field
            id="location"
            label="Location"
            value={profile.location || ""}
            onChange={(v) => update("location", v)}
            placeholder="Los Angeles, CA"
          />
          <Field
            id="addressLine"
            label="Office / address line"
            value={profile.addressLine || ""}
            onChange={(v) => update("addressLine", v)}
            placeholder="123 Example Street"
          />
        </div>
      </div>
    </div>
  );
}
