import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Stylized map coordinates (viewBox 0 0 100 62) — Atlantic-centered, matches typical globe hero framing.
 */
const C = {
  miami: { x: 22, y: 44 },
  london: { x: 45, y: 30 },
  moscow: { x: 54, y: 28 },
  dubai: { x: 58, y: 40 },
  shanghai: { x: 74, y: 38 },
  saoPaulo: { x: 28, y: 58 },
  tokyo: { x: 84, y: 36 },
} as const;

type CityKey = keyof typeof C;

function arcPath(a: (typeof C)[CityKey], b: (typeof C)[CityKey]): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.min(14, Math.abs(b.x - a.x) * 0.12);
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

const ROUTES: { from: CityKey; to: CityKey; dur: string; delay: string }[] = [
  { from: "miami", to: "london", dur: "5s", delay: "0s" },
  { from: "london", to: "moscow", dur: "4.2s", delay: "0.4s" },
  { from: "london", to: "dubai", dur: "4.8s", delay: "0.2s" },
  { from: "dubai", to: "shanghai", dur: "5.5s", delay: "0.6s" },
  { from: "shanghai", to: "tokyo", dur: "3.8s", delay: "0.1s" },
  { from: "miami", to: "saoPaulo", dur: "4.5s", delay: "0.8s" },
  { from: "london", to: "saoPaulo", dur: "6s", delay: "1.2s" },
  { from: "moscow", to: "shanghai", dur: "5.2s", delay: "0.5s" },
];

export function TradeRoutesHeroOverlay({ className }: { className?: string }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none",
        "[&_svg]:h-full [&_svg]:w-full [&_svg]:opacity-[0.55] md:[&_svg]:opacity-[0.65]",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="trade-route-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.45" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="trade-route-lines">
          {ROUTES.map(({ from, to, dur, delay }, i) => {
            const d = arcPath(C[from], C[to]);
            const flowStyle = reduceMotion
              ? undefined
              : ({ animationDelay: delay, animationDuration: dur } satisfies CSSProperties);
            return (
              <g key={`${from}-${to}-${i}`}>
                <g filter="url(#trade-route-glow)">
                  <path
                    d={d}
                    fill="none"
                    stroke="rgb(34 211 238 / 0.12)"
                    strokeWidth="0.32"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className={reduceMotion ? "" : "trade-route-dash"}
                    style={flowStyle}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="rgb(45 212 191 / 0.18)"
                    strokeWidth="0.18"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                {!reduceMotion && (
                  <>
                    <circle r="0.5" fill="rgb(207 250 254 / 0.95)">
                      <animateMotion dur={dur} repeatCount="indefinite" path={d} begin={delay} rotate="auto" />
                    </circle>
                    <circle r="1.2" fill="none" stroke="rgb(34 211 238 / 0.35)" strokeWidth="0.1" vectorEffect="non-scaling-stroke">
                      <animateMotion dur={dur} repeatCount="indefinite" path={d} begin={delay} rotate="auto" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </g>

        <g className="trade-route-hubs">
          {Object.entries(C).map(([key, { x, y }]) => (
            <g key={key}>
              <circle cx={x} cy={y} r="0.9" fill="rgb(34 211 238 / 0.12)" className={reduceMotion ? "" : "trade-hub-glow"} />
              <circle cx={x} cy={y} r="0.35" fill="rgb(165 243 252 / 0.55)" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
