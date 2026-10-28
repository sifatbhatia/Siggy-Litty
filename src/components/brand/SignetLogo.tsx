import { SignetMark } from "./SignetMark";

export function SignetLogo({
  size = 24,
  subtitle,
  className = "",
}: {
  size?: number;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={`signet-brand ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <SignetMark size={size} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            className="brand-wordmark"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "22px",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
            }}
          >
            Signet
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              marginLeft: "2px",
              verticalAlign: "super",
            }}
          >
            ™
          </span>
        </div>
        {subtitle && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginTop: "3px",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
