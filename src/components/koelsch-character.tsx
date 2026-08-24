import { useId } from "react";

export function KoebesIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 230 235"
      role="img"
      aria-label="Gezeichneter Köbes mit einem Kranz voller Kölsch-Stangen"
      className={className}
    >
      <g
        stroke="#40352e"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M68 226c2-46 7-78 16-92 10-13 25-20 45-19 22 1 38 10 47 27l8 84Z"
          fill="#f5ede1"
        />
        <path d="M86 133c8-8 18-13 29-16l13 21 13-20c12 3 23 9 31 18l-8 58H94Z" fill="#315f7d" />
        <path d="m115 117 13 21 13-20" fill="none" />
        <path d="M93 187h72l8 39H84Z" fill="#3f7594" />
        <path d="M94 187c22 5 46 5 70 0" fill="none" opacity=".55" />

        <path d="M88 142c-11 11-16 27-16 47 0 8 8 11 14 6l21-21-10-10-13 12c2-11 7-20 14-27Z" fill="#edc9aa" />
        <path d="m98 164 10 10-8 8-10-10Z" fill="#f5ede1" />

        <path d="M160 144c10 2 20 9 28 19l14-10 7 10-20 16c-5 4-11 3-15-2l-22-23Z" fill="#edc9aa" />
        <path d="m200 153 9 10 7-6-8-10Z" fill="#f5ede1" />

        <path d="M91 64c1-29 18-47 42-45 23 2 36 21 32 48l-5 28c-4 18-16 28-32 27-18-1-30-14-34-33Z" fill="#edc9aa" />
        <path d="M92 65c-4-28 14-50 41-50 20 0 34 12 37 31-14-8-28-9-41-5-10 3-22 13-30 26Z" fill="#504138" />
        <path d="M95 72c-9-5-13 5-8 14 3 5 7 7 11 5M163 70c8-4 11 6 6 14-3 5-6 7-10 5" fill="#edc9aa" />
        <path d="M111 69c4-3 9-3 14 0M143 70c4-2 8-1 11 2" fill="none" />
        <circle cx="119" cy="76" r="2" fill="#40352e" stroke="none" />
        <circle cx="149" cy="77" r="2" fill="#40352e" stroke="none" />
        <path d="m135 76-3 13 7 2M119 99c8 5 17 5 25-1" fill="none" />

        <path d="M91 193h28v32H89Z" fill="#765036" />
        <path d="M94 196c7 4 14 4 21 0" fill="none" opacity=".65" />
        <circle cx="105" cy="210" r="2" fill="#d4a45d" stroke="none" />

        <ellipse cx="196" cy="150" rx="32" ry="7" fill="#765036" />
        <path d="M169 149h55" fill="none" />
        {[174, 193, 212].map((x) => (
          <g key={x}>
            <path d={`M${x} 95h10l-1 52h-8Z`} fill="#fffdf8" />
            <path d={`M${x + 1.5} 109h7l-.8 37h-5.4Z`} fill="#e4ae34" stroke="none" />
            <path d={`M${x + 1.5} 104h7v7h-7Z`} fill="#f7eedb" stroke="none" />
          </g>
        ))}
        <path d="M189 158c3 5 7 8 11 10" fill="none" />
      </g>
    </svg>
  );
}

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
  const beer = level === "full" ? { y: 10, height: 35 } : { y: 27, height: 18 };

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
