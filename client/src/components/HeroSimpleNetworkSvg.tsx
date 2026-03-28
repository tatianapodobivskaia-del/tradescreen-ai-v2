import { cn } from "@/lib/utils";

/** Positions in viewBox 0–100 (percent of overlay width/height). */
const DOTS: readonly [number, number][] = [
  [18, 22],
  [32, 28],
  [48, 18],
  [62, 26],
  [78, 20],
  [88, 32],
  [22, 48],
  [38, 55],
  [52, 48],
  [68, 58],
  [82, 48],
  [45, 72],
];

const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [8, 11],
];

function edgePath(a: number, b: number): string {
  const [x1, y1] = DOTS[a];
  const [x2, y2] = DOTS[b];
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export function HeroSimpleNetworkSvg({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "absolute inset-0 h-full w-full pointer-events-none select-none",
        className
      )}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g className="hero-simple-net-lines">
        {EDGES.map(([from, to], i) => (
          <path
            key={`e-${i}`}
            d={edgePath(from, to)}
            pathLength={100}
            fill="none"
            className="hero-simple-net-line"
          />
        ))}
      </g>
      <g className="hero-simple-net-dots">
        {DOTS.map(([cx, cy], i) => (
          <circle key={`d-${i}`} cx={cx} cy={cy} r={0.35} className="hero-simple-net-dot" fill="rgb(34 211 238)" />
        ))}
      </g>
    </svg>
  );
}
