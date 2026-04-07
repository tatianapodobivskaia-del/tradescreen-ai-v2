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

const history: SessionScreeningResult[] = [];
let lastScreeningSnapshot:
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
    }
  | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function addScreeningResult(result: SessionScreeningResult): void {
  history.unshift(result);
  // keep the session lightweight
  if (history.length > 200) history.length = 200;
  emit();
}

export function setLastScreeningSnapshot(
  snapshot:
    | { kind: "single"; screeningResults: unknown; lastScreenInput: unknown }
    | { kind: "batch"; batchScreeningRows: unknown }
    | null
): void {
  if (!snapshot) {
    lastScreeningSnapshot = null;
    emit();
    return;
  }
  lastScreeningSnapshot =
    snapshot.kind === "single"
      ? { kind: "single", capturedAt: new Date().toISOString(), ...snapshot }
      : { kind: "batch", capturedAt: new Date().toISOString(), ...snapshot };
  emit();
}

export function getLastScreeningSnapshot():
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
    }
  | null {
  return lastScreeningSnapshot;
}

export function getScreeningHistory(): SessionScreeningResult[] {
  return history;
}

export function getSessionStats(): {
  total: number;
  high: number;
  avgProcessingMs: number | null;
} {
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
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionSnapshot(): SessionScreeningResult[] {
  return history;
}

