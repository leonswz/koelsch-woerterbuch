import { useId } from "react";

type GlassLevel = "full" | "half" | "empty";

export function KoelschGlassStatus({
  level,
  className = "",
  label,
}: {
  level: GlassLevel;
  className?: string;
  label?: string;
}) {
  const clipId = useId();
  const beer = level === "full" ? { y: 10, height: 35 } : { y: 24, height: 24 };

  return (
    <svg
      viewBox="0 0 34 56"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M9 3h16l-2 45c-.2 3-2.3 4.5-6 4.5S11.2 51 11 48Z" />
        </clipPath>
      </defs>
      {level !== "empty" ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x="7" y={beer.y} width="20" height={beer.height} fill="#dfa82f" />
          <rect x="7" y={beer.y} width="20" height="5" fill="#f7edda" />
        </g>
      ) : null}
      <path
        d="M9 3h16l-2 45c-.2 3-2.3 4.5-6 4.5S11.2 51 11 48Z"
        fill={level === "empty" ? "#fff" : "none"}
        fillOpacity=".6"
        stroke="#5c554c"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="17" cy="53" rx="9" ry="1.5" fill="#d9d0c3" opacity=".7" />
    </svg>
  );
}
