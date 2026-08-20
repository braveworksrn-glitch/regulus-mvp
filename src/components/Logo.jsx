/**
 * Regulus wordmark + mark.
 *
 * The mark is a four-point navigation star — Regulus is the brightest star
 * in Leo and is actually a multiple-star system, hence the small companion
 * point. The SVG fills with currentColor so it themes with its parent;
 * by default the mark takes the accent token and the wordmark inherits ink.
 */
export default function Logo({
  className = "",
  markClassName = "text-accent",
  withWordmark = true,
  size = 22,
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={`shrink-0 ${markClassName}`}
      >
        {/* primary star */}
        <path d="M12 0.5 L14.5 9.5 L23.5 12 L14.5 14.5 L12 23.5 L9.5 14.5 L0.5 12 L9.5 9.5 Z" />
        {/* companion star */}
        <circle cx="20.6" cy="3.6" r="1.5" />
      </svg>
      {withWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight">
          Regulus
        </span>
      )}
    </span>
  );
}
