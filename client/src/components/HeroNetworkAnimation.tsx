import { useEffect, useMemo, useRef, useState } from 'react';

const nodes = [
  { x: 18, y: 25 }, { x: 28, y: 55 }, { x: 35, y: 75 },
  { x: 42, y: 30 }, { x: 48, y: 48 }, { x: 55, y: 20 },
  { x: 52, y: 65 }, { x: 62, y: 40 }, { x: 68, y: 60 },
  { x: 75, y: 28 }, { x: 72, y: 50 }, { x: 80, y: 70 },
  { x: 85, y: 35 }, { x: 88, y: 55 }, { x: 22, y: 42 },
  { x: 38, y: 50 }, { x: 58, y: 32 }, { x: 78, y: 45 },
];

type ActiveFlow = {
  id: number;
  from: number;
  to: number;
  startedAt: number;
  durationMs: number;
};

export default function HeroNetworkAnimation() {
  const [activeFlows, setActiveFlows] = useState<ActiveFlow[]>([]);
  const flowIdRef = useRef(0);
  const nextSpawnAtRef = useRef(0);

  const directionalRoutes = useMemo(
    () =>
      [
        [0, 4],
        [4, 7],
        [7, 10],
        [10, 12],
        [1, 15],
        [15, 16],
        [16, 7],
        [3, 5],
        [5, 9],
        [9, 17],
        [6, 8],
        [8, 11],
      ] as const,
    [],
  );

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    nextSpawnAtRef.current = performance.now() + 350;

    const getRandomBetween = (min: number, max: number) => min + Math.random() * (max - min);

    const tick = (now: number) => {
      if (cancelled) return;

      setActiveFlows((prev) => {
        const ongoing = prev.filter((flow) => now - flow.startedAt < flow.durationMs);

        if (now < nextSpawnAtRef.current || ongoing.length >= 5) {
          return ongoing;
        }

        const route = directionalRoutes[Math.floor(Math.random() * directionalRoutes.length)];
        const [from, to] = route;

        const next: ActiveFlow = {
          id: flowIdRef.current++,
          from,
          to,
          startedAt: now,
          durationMs: getRandomBetween(1700, 2500),
        };

        // Spawn at irregular cadence between 0.8s and 2s.
        nextSpawnAtRef.current = now + getRandomBetween(800, 2000);
        return [...ongoing, next];
      });

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [directionalRoutes]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.72,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {activeFlows.map((flow) => {
        const from = nodes[flow.from];
        const to = nodes[flow.to];
        const elapsed = performance.now() - flow.startedAt;
        const progress = Math.max(0, Math.min(1, elapsed / flow.durationMs));
        const envelope = progress < 0.18
          ? progress / 0.18
          : progress > 0.88
            ? (1 - progress) / 0.12
            : 1;
        const pulseX = from.x + (to.x - from.x) * progress;
        const pulseY = from.y + (to.y - from.y) * progress;

        return (
          <g key={flow.id}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(56,189,248,0.42)"
              strokeWidth="0.16"
              strokeOpacity={0.12 + envelope * 0.42}
            />
            <circle
              cx={pulseX}
              cy={pulseY}
              r="0.45"
              fill="rgba(125,211,252,0.95)"
              opacity={0.35 + envelope * 0.6}
            />
          </g>
        );
      })}

      {nodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.x}
          cy={n.y}
          r={i % 4 === 0 ? "0.5" : "0.36"}
          fill="rgba(125,211,252,0.55)"
        >
          <animate
            attributeName="opacity"
            values={i % 3 === 0 ? "0.22;0.56;0.22" : "0.18;0.42;0.18"}
            dur={`${4.5 + (i % 5)}s`}
            repeatCount="indefinite"
            begin={`${(i * 0.37) % 4}s`}
          />
        </circle>
      ))}
    </svg>
  );
}
