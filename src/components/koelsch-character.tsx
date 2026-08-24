import { useId } from "react";

export function KoebesIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 310"
      role="img"
      aria-label="Gezeichneter Köbes mit einem Kranz voller Kölsch-Stangen"
      className={className}
    >
      <ellipse cx="116" cy="294" rx="67" ry="9" fill="#e7e0d4" />
      <g
        stroke="#3c332d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M89 241 82 286h27l8-45" fill="#393633" />
        <path d="m139 240 9 46h27l-9-52" fill="#393633" />
        <path d="M79 286h33v9H75c-3-4-1-7 4-9Z" fill="#292725" />
        <path d="M147 286h29c7 2 9 5 7 9h-37Z" fill="#292725" />

        <path
          d="M78 116c12-12 28-17 45-16 19 1 37 9 46 24l-10 119c-26 13-58 12-85-2Z"
          fill="#f8f1e7"
        />
        <path
          d="M90 109c7-5 15-8 24-9l10 19 10-18c10 2 18 6 25 12l-8 72H96Z"
          fill="#355d79"
        />
        <path d="m112 101 12 18 12-18" fill="none" />
        <path d="M97 181h55l8 63c-28 10-57 9-84-3l11-59Z" fill="#386f91" />
        <path d="M95 181c20 6 40 6 59 0" fill="none" opacity=".65" />
        <path d="M124 119v60" fill="none" opacity=".55" />
        <circle cx="124" cy="137" r="2" fill="#3c332d" stroke="none" />
        <circle cx="124" cy="156" r="2" fill="#3c332d" stroke="none" />

        <path
          d="M79 120c-15 13-21 34-19 60 1 8 8 12 15 8l22-24-9-11-15 15c1-17 7-29 17-36Z"
          fill="#f2d0b5"
        />
        <path d="m91 153 10 12-8 8-11-12Z" fill="#f8f1e7" />
        <path
          d="M163 122c9 8 14 20 15 35l14-13 9 10-25 25c-7 5-14 0-14-8l-10-39Z"
          fill="#f2d0b5"
        />
        <path d="m191 144 10 11 7-7-9-12Z" fill="#f8f1e7" />

        <path d="M90 56c1-25 18-40 40-37 19 2 31 17 29 37l-5 29c-5 17-17 25-32 23-16-2-26-14-29-31Z" fill="#f2d0b5" />
        <path
          d="M91 57c-5-23 11-43 35-43 18 0 32 10 36 28-12-7-24-9-35-6-9 3-17 10-23 20Z"
          fill="#57463a"
        />
        <path d="M93 64c-9-5-14 4-9 13 3 6 7 8 12 6" fill="#f2d0b5" />
        <path d="M157 62c8-4 12 5 7 13-3 5-7 7-11 5" fill="#f2d0b5" />
        <path d="M108 61c5-3 10-3 15 0M139 62c4-2 8-1 11 2" fill="none" />
        <circle cx="117" cy="68" r="2.2" fill="#3c332d" stroke="none" />
        <circle cx="144" cy="69" r="2.2" fill="#3c332d" stroke="none" />
        <path d="m132 68-3 13 7 2" fill="none" />
        <path d="M117 90c8 5 17 5 25-1" fill="none" />
        <path d="M112 48c9-5 25-6 37 0" fill="none" opacity=".7" />

        <path d="M76 205c-8 12-8 29 0 40" fill="none" />
        <path d="M79 199h30v35H77Z" fill="#7b4f32" />
        <path d="M82 202c7 5 15 5 23 0" fill="none" opacity=".7" />
        <circle cx="94" cy="217" r="2" fill="#d3a45d" stroke="none" />

        <ellipse cx="205" cy="142" rx="31" ry="8" fill="#7b4f32" />
        <path d="M178 141h54" fill="none" />
        {[184, 196, 208, 220].map((x) => (
          <g key={x}>
            <path d={`M${x} 102h8l-1 37h-6Z`} fill="#f8fbfb" />
            <path d={`M${x + 1} 112h6l-1 26h-4Z`} fill="#e5b84d" stroke="none" />
            <path d={`M${x + 1} 108h6v6h-6Z`} fill="#f7f0dc" stroke="none" />
          </g>
        ))}
        <path d="M203 150c4 7 8 11 12 14" fill="none" />
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
  const beer = level === "full" ? { y: 15, height: 42 } : { y: 36, height: 21 };

  return (
    <svg
      viewBox="0 0 42 72"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M11 5h20l-2.5 57c-.2 4-3 6-7.5 6s-7.3-2-7.5-6Z" />
        </clipPath>
      </defs>
      {level !== "empty" ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x="9" y={beer.y} width="24" height={beer.height} fill="#e4af35" />
          <rect x="9" y={beer.y} width="24" height="5" fill="#f8efdc" />
          <circle cx="18" cy="46" r="1" fill="#fff" opacity=".75" />
          <circle cx="25" cy="31" r=".8" fill="#fff" opacity=".7" />
          <circle cx="21" cy="52" r=".7" fill="#fff" opacity=".65" />
        </g>
      ) : null}
      <path
        d="M11 5h20l-2.5 57c-.2 4-3 6-7.5 6s-7.3-2-7.5-6Z"
        fill={level === "empty" ? "#fff" : "none"}
        fillOpacity=".55"
        stroke="#5c554c"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 8h18" stroke="#fff" strokeWidth="1" opacity=".8" />
      <ellipse cx="21" cy="68" rx="11" ry="2" fill="#d9d0c3" opacity=".65" />
    </svg>
  );
}
