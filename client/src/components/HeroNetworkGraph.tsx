import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

/**
 * Fixed node layout (viewBox 0 0 100 62) — scattered like a global trade / compliance network.
 * 18 nodes, 28 edges, fully connected graph.
 */
const NODES = [
  { x: 10, y: 26 },
  { x: 8, y: 46 },
  { x: 22, y: 14 },
  { x: 28, y: 36 },
  { x: 18, y: 58 },
  { x: 40, y: 22 },
  { x: 36, y: 48 },
  { x: 34, y: 34 },
  { x: 52, y: 18 },
  { x: 54, y: 44 },
  { x: 48, y: 58 },
  { x: 66, y: 28 },
  { x: 70, y: 50 },
  { x: 62, y: 58 },
  { x: 80, y: 20 },
  { x: 84, y: 40 },
  { x: 88, y: 54 },
  { x: 74, y: 36 },
] as const;

/** Undirected edges — spanning tree (17) + chords (11) = 28 unique links. */
const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 4],
  [4, 10],
  [10, 9],
  [9, 6],
  [6, 3],
  [3, 2],
  [3, 7],
  [7, 5],
  [5, 8],
  [8, 11],
  [11, 14],
  [14, 15],
  [15, 16],
  [16, 12],
  [12, 13],
  [17, 15],
  [0, 2],
  [2, 5],
  [6, 4],
  [8, 9],
  [9, 12],
  [10, 13],
  [11, 17],
  [14, 17],
  [3, 8],
  [7, 9],
  [16, 17],
] as const;

function linePath(a: number, b: number): string {
  const p = NODES[a];
  const q = NODES[b];
  return `M ${p.x} ${p.y} L ${q.x} ${q.y}`;
}

/** Core radius in viewBox units (~4px on ~1100px-wide hero). */
const NODE_CORE_R = 0.24;
const NODE_HALO_R = 0.88;

export function HeroNetworkGraph({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none",
        "[&_svg]:h-full [&_svg]:w-full [&_svg]:opacity-[0.85]",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="hero-network-node-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.85" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="hero-network-edges-base">
          {EDGES.map(([from, to], idx) => (
            <path
              key={`base-${from}-${to}`}
              d={linePath(from, to)}
              fill="none"
              stroke="rgb(34 211 238 / 0.28)"
              strokeWidth={1}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0.22 + (idx % 5) * 0.035 }}
            />
          ))}
        </g>

        <g className="hero-network-edges-pulse">
          {EDGES.map(([from, to], idx) => {
            const style = {
              "--net-flow-dur": `${2.2 + (idx % 7) * 0.22}s`,
              "--net-flow-delay": `${((idx * 0.11) % 2.5).toFixed(2)}s`,
            } as CSSProperties;
            return (
              <path
                key={`pulse-${from}-${to}`}
                d={linePath(from, to)}
                fill="none"
                pathLength={100}
                stroke="rgb(103 232 249 / 0.95)"
                strokeWidth={1}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="hero-network-edge-pulse"
                style={style}
              />
            );
          })}
        </g>

        <g className="hero-network-nodes">
          {NODES.map((node, idx) => (
            <g key={idx}>
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_HALO_R}
                fill="rgb(34 211 238 / 0.22)"
                filter="url(#hero-network-node-glow)"
              />
              <circle cx={node.x} cy={node.y} r={NODE_CORE_R} fill="rgb(103 232 249)" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
