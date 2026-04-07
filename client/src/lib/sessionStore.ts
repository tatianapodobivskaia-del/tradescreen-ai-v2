/**
 * In-memory session store (resets on full page reload).
 * Uses globalThis so all imports share one store even if Vite duplicates the module in multiple chunks / HMR.
 * Import only from `@/lib/sessionStore` (no relative duplicates).
 */
export type SessionScreeningSource = "screening" | "scanner";

export type SessionScreeningResult = {
  timestamp: string;
  vendorName: string;
  risk: "HIGH" | "MEDIUM" | "LOW" | string;
  score?: number;
  assessment?: string;
  action?: string;
  source: SessionScreeningSource;
  durationMs?: number;
};

type LastSnap =
  | {
      kind: "single";
      capturedAt: string;
      screeningResults: unknown;
      lastScreenInput: unknown;
    }
  | {
      kind: "batch";
      capturedAt: string;
      batchScreeningRows: unknown;
    };

type SessionBucket = {
  history: SessionScreeningResult[];
  lastScreeningSnapshot: LastSnap | null;
  listeners: Set<() => void>;
};

const SESSION_GLOBAL_KEY = "__TradeScreenAI_sessionStore_v1__";

/** Prefer `window` in the browser so the bucket survives as long as the tab (same as globalThis, explicit for debugging). */
function getRoot(): Record<string, SessionBucket | undefined> {
  if (typeof window !== "undefined") {
    return window as unknown as Record<string, SessionBucket | undefined>;
  }
  return globalThis as unknown as Record<string, SessionBucket | undefined>;
}

function getBucket(): SessionBucket {
  const g = getRoot();
  let b = g[SESSION_GLOBAL_KEY];
  if (!b) {
    b = { history: [], lastScreeningSnapshot: null, listeners: new Set() };
    g[SESSION_GLOBAL_KEY] = b;
  }
  return b;
}

function emit(): void {
  const { listeners } = getBucket();
  for (const l of listeners) l();
}

export function addScreeningResult(result: SessionScreeningResult): void {
  const { history } = getBucket();
  history.unshift(result);
  if (history.length > 200) history.length = 200;
  emit();
}

export function setLastScreeningSnapshot(
  snapshot:
    | { kind: "single"; screeningResults: unknown; lastScreenInput: unknown }
    | { kind: "batch"; batchScreeningRows: unknown }
    | null
): void {
  const bucket = getBucket();
  if (!snapshot) {
    bucket.lastScreeningSnapshot = null;
    emit();
    return;
  }
  bucket.lastScreeningSnapshot =
    snapshot.kind === "single"
      ? { kind: "single", capturedAt: new Date().toISOString(), ...snapshot }
      : { kind: "batch", capturedAt: new Date().toISOString(), ...snapshot };
  emit();
}

export function getLastScreeningSnapshot(): LastSnap | null {
  return getBucket().lastScreeningSnapshot;
}

export function getScreeningHistory(): SessionScreeningResult[] {
  return getBucket().history;
}

export function getSessionStats(): {
  total: number;
  high: number;
  avgProcessingMs: number | null;
} {
  const history = getBucket().history;
  const total = history.length;
  let high = 0;
  let sum = 0;
  let n = 0;
  for (const r of history) {
    if ((r.risk || "").toUpperCase() === "HIGH") high++;
    if (typeof r.durationMs === "number" && Number.isFinite(r.durationMs)) {
      sum += r.durationMs;
      n++;
    }
  }
  return { total, high, avgProcessingMs: n ? sum / n : null };
}

export function subscribeSession(listener: () => void): () => void {
  const { listeners } = getBucket();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionSnapshot(): SessionScreeningResult[] {
  return getBucket().history;
}

