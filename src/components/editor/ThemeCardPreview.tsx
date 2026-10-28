import type { Profile, Theme } from "../../lib/types";

export function ThemeCardPreview({
  theme,
  profile,
}: {
  theme: Theme;
  profile: Profile;
  isSelected?: boolean;
}) {
  const isNoir = theme.id === "noir";
  const isCobalt = theme.id === "cobalt";
  const isLinen = theme.id === "linen";
  const isBare = theme.id === "bare";

  // Card theme surface simulation matching section 04 of the identity board
  let cardBg = "#FFFFFF";
  let textColor = "#111111";
  let mutedColor = "#666666";
  let dividerColor = "rgba(17, 17, 17, 0.12)";

  if (isNoir) {
    cardBg = "#080B0B";
    textColor = "#FCFAF6";
    mutedColor = "#888888";
    dividerColor = "rgba(255, 255, 255, 0.18)";
  } else if (isCobalt) {
    cardBg = "#0A2540";
    textColor = "#FFFFFF";
    mutedColor = "#9BB4D4";
    dividerColor = "rgba(255, 255, 255, 0.2)";
  } else if (isLinen) {
    cardBg = "#F7F4EE";
    textColor = "#2F241F";
    mutedColor = "#6F6058";
    dividerColor = "#EAD9CC";
  } else if (isBare) {
    cardBg = "transparent";
    textColor = "#111111";
    mutedColor = "#666666";
    dividerColor = "rgba(17, 17, 17, 0.12)";
  }

  return (
    <div
      className="signet-theme-mini"
      style={{
        backgroundColor: cardBg,
        color: textColor,
        borderColor: dividerColor,
      }}
    >
      <div className="signet-theme-mini__body">
        <div className="signet-theme-mini__info">
          <div
            className="signet-theme-mini__name"
            style={{
              fontFamily: isLinen ? "var(--font-serif)" : "var(--font-sans)",
              fontWeight: 600,
            }}
          >
            {profile.fullName || "Your Name"}
          </div>
          <div className="signet-theme-mini__title" style={{ color: mutedColor }}>
            {profile.title || "Design Engineer"}
          </div>
          <div
            className="signet-theme-mini__rule"
            style={{ backgroundColor: dividerColor }}
          />
          <div className="signet-theme-mini__contact" style={{ color: mutedColor }}>
            <span>{profile.email || "hello@domain.com"}</span>
            {profile.phone && <span>{profile.phone}</span>}
            {profile.location && <span>{profile.location}</span>}
          </div>
        </div>

        {profile.avatarUrl && !isBare && (
          <div className="signet-theme-mini__photo-wrap">
            <img
              src={profile.avatarUrl}
              alt=""
              className="signet-theme-mini__photo"
              style={{
                filter: isNoir || isLinen ? "grayscale(100%)" : "none",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
