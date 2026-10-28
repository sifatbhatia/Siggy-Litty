export function SignetMark({
  size = 24,
  className = "",
  monochrome = false,
}: {
  size?: number;
  className?: string;
  monochrome?: boolean;
}) {
  return (
    <svg
      width={size}
      height={Math.round((size * 44) / 36)}
      viewBox="0 0 36 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Signet symbol"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Signet Folded Ribbon S - From Brand Identity Board */}
      {/* Upper loop: upright facet */}
      <polygon
        points="8,23 8,10 19,4 19,17"
        fill={monochrome ? "currentColor" : "var(--graphite, #1F1F1F)"}
      />
      {/* Upper loop: shaded fold facet */}
      <polygon
        points="19,4 28,10 28,21 19,17"
        fill={monochrome ? "currentColor" : "var(--cobalt, #2F6FE4)"}
        fillOpacity={monochrome ? 0.6 : 0.9}
      />
      {/* Lower loop: upright facet */}
      <polygon
        points="28,21 28,34 17,40 17,27"
        fill={monochrome ? "currentColor" : "var(--graphite, #1F1F1F)"}
      />
      {/* Lower loop: shaded fold facet */}
      <polygon
        points="17,40 8,34 8,23 17,27"
        fill={monochrome ? "currentColor" : "var(--cobalt, #2F6FE4)"}
        fillOpacity={monochrome ? 0.6 : 0.9}
      />
    </svg>
  );
}
