import { useEffect, useRef } from 'react';

const nodes = [
  { x: 18, y: 25 }, { x: 28, y: 55 }, { x: 35, y: 75 },
  { x: 42, y: 30 }, { x: 48, y: 48 }, { x: 55, y: 20 },
  { x: 52, y: 65 }, { x: 62, y: 40 }, { x: 68, y: 60 },
  { x: 75, y: 28 }, { x: 72, y: 50 }, { x: 80, y: 70 },
  { x: 85, y: 35 }, { x: 88, y: 55 }, { x: 22, y: 42 },
  { x: 38, y: 50 }, { x: 58, y: 32 }, { x: 78, y: 45 },
];

const edges = [
  [0,1],[0,4],[0,14],[1,2],[1,14],[1,15],[3,4],[3,5],[3,16],
  [4,5],[4,7],[4,15],[5,9],[5,16],[6,7],[6,8],[6,11],[7,8],
  [7,10],[7,16],[8,10],[8,11],[9,10],[9,12],[9,17],[10,11],
  [10,12],[10,17],[11,13],[12,13],[12,17],[13,17],[14,15],[15,16],
];

export default function HeroNetworkAnimation() {
  const reducedEdges = edges.filter((_, i) => i % 2 === 0);
  const reducedNodes = nodes.filter((_, i) => i % 2 === 0);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.75,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {reducedEdges.map(([a, b], i) => (
        <line
          key={`edge-${i}`}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="rgba(56,189,248,0.14)"
          strokeWidth="0.12"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.08;0.22;0.08"
            dur={`${5 + (i % 4)}s`}
            repeatCount="indefinite"
            begin={`${(i * 0.55) % 4}s`}
          />
        </line>
      ))}
      {reducedNodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.x} cy={n.y} r="0.4"
          fill="rgba(125,211,252,0.42)"
        >
          <animate
            attributeName="opacity"
            values="0.26;0.6;0.26"
            dur={`${4 + (i % 3)}s`}
            repeatCount="indefinite"
            begin={`${(i * 0.4) % 3}s`}
          />
        </circle>
      ))}
    </svg>
  );
}
