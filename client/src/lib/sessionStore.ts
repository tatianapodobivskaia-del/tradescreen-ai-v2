/**
 * In-memory session store (resets on full page reload).
 * Uses globalThis so all imports share one store even if Vite duplicates the module in multiple chunks / HMR.
 * Import only from `@/lib/sessionStore` (no relative duplicates).
 */
export type SessionScreeningSource = "screening" | "scanner";

/** Serializable score breakdown (matches Screening scoreBreakdown). */
export type SessionScoreBreakdown = {
  name: number;
  country: number;
  amount: number;
  doc: number;
  translit: number;
  total: number;
};

/** Serializable transliteration snapshot for audit / PDF replay. */
export type SessionTransliterationInfo = {
  variants: string[];
  direction: "cyrillic" | "latin";
  standards: {
    iso9: string;
    icao: string;
    bgn: string;
    informal: string;
  } | null;
};

export type SessionScreeningResult = {
  timestamp: string;
  vendorName: string;
  risk: "HIGH" | "MEDIUM" | "LOW" | string;
  /** Composite screening score (0–100). */
  score?: number;
  /** Same as score when recorded from Screening; optional for clarity in audit UI. */
  compositeScore?: number;
  assessment?: string;
  action?: string;
  source: SessionScreeningSource;
  durationMs?: number;
  country?: string;
  amount?: string;
  docType?: string;
  scoreBreakdown?: SessionScoreBreakdown;
  reasoning?: string;
  transliterationInfo?: SessionTransliterationInfo | null;
  listsChecked?: string;
  scrId?: string;
};

/** UI state restored when returning to Screening via SPA navigation */
export type ScreeningSnapshotUiFields = {
  uploadedFileName: string | null;
  parsedVendorCount: number;
  parsedUploadRows: unknown | null;
  missingColumns: unknown;
  uploadScreeningDone: boolean;
  aiDeepAnalysisResults: unknown | null;
  aiAnalysisComplete: boolean;
};

type LastSnap =
  | ({
      kind: "single";
      capturedAt: string;
      screeningResults: unknown;
      lastScreenInput: unknown;
    } & ScreeningSnapshotUiFields)
  | ({
      kind: "batch";
      capturedAt: string;
      batchScreeningRows: unknown;
    } & ScreeningSnapshotUiFields);

type SessionBucket = {
  history: SessionScreeningResult[];
  lastScreeningSnapshot: LastSnap | null;
  listeners: Set<() => void>;
};

const SESSION_GLOBAL_KEY = "__TradeScreenAI_sessionStore_v1__";

const SNAP_UI_DEFAULTS: ScreeningSnapshotUiFields = {
  uploadedFileName: null,
  parsedVendorCount: 0,
  parsedUploadRows: null,
  missingColumns: [],
  uploadScreeningDone: false,
  aiDeepAnalysisResults: null,
  aiAnalysisComplete: false,
};

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

/** Unique screening reference for audit trail / PDF (in-tab only). */
export function createScrId(): string {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SCR-2026-${part}`;
}

export function addScreeningResult(result: SessionScreeningResult): void {
  const { history } = getBucket();
  history.unshift(result);
  if (history.length > 200) history.length = 200;
  emit();
}

export type ScreeningSnapshotInput =
  | ({ kind: "single"; screeningResults: unknown; lastScreenInput: unknown } & Partial<ScreeningSnapshotUiFields>)
  | ({ kind: "batch"; batchScreeningRows: unknown } & Partial<ScreeningSnapshotUiFields>);

function normalizeUiFields(partial: Partial<ScreeningSnapshotUiFields> | undefined): ScreeningSnapshotUiFields {
  return {
    uploadedFileName: partial?.uploadedFileName ?? SNAP_UI_DEFAULTS.uploadedFileName,
    parsedVendorCount: partial?.parsedVendorCount ?? SNAP_UI_DEFAULTS.parsedVendorCount,
    parsedUploadRows: partial?.parsedUploadRows ?? SNAP_UI_DEFAULTS.parsedUploadRows,
    missingColumns: partial?.missingColumns ?? SNAP_UI_DEFAULTS.missingColumns,
    uploadScreeningDone: partial?.uploadScreeningDone ?? SNAP_UI_DEFAULTS.uploadScreeningDone,
    aiDeepAnalysisResults: partial?.aiDeepAnalysisResults ?? SNAP_UI_DEFAULTS.aiDeepAnalysisResults,
    aiAnalysisComplete: partial?.aiAnalysisComplete ?? SNAP_UI_DEFAULTS.aiAnalysisComplete,
  };
}

export function setLastScreeningSnapshot(snapshot: ScreeningSnapshotInput | null): void {
  const bucket = getBucket();
  if (!snapshot) {
    bucket.lastScreeningSnapshot = null;
    emit();
    return;
  }
  const ui = normalizeUiFields(snapshot);
  const capturedAt = new Date().toISOString();
  bucket.lastScreeningSnapshot =
    snapshot.kind === "single"
      ? {
          kind: "single",
          capturedAt,
          screeningResults: snapshot.screeningResults,
          lastScreenInput: snapshot.lastScreenInput,
          ...ui,
        }
      : {
          kind: "batch",
          capturedAt,
          batchScreeningRows: snapshot.batchScreeningRows,
          ...ui,
        };
  emit();
}

/** Merge fields into the current snapshot (e.g. after upload completes or AI analysis finishes). */
export function patchLastScreeningSnapshot(patch: Partial<ScreeningSnapshotUiFields>): void {
  const bucket = getBucket();
  const s = bucket.lastScreeningSnapshot;
  if (!s) return;
  if (typeof patch.uploadedFileName !== "undefined") s.uploadedFileName = patch.uploadedFileName ?? null;
  if (typeof patch.parsedVendorCount !== "undefined") s.parsedVendorCount = patch.parsedVendorCount;
  if (typeof patch.parsedUploadRows !== "undefined") s.parsedUploadRows = patch.parsedUploadRows;
  if (typeof patch.missingColumns !== "undefined") s.missingColumns = patch.missingColumns;
  if (typeof patch.uploadScreeningDone !== "undefined") s.uploadScreeningDone = patch.uploadScreeningDone;
  if (typeof patch.aiDeepAnalysisResults !== "undefined") s.aiDeepAnalysisResults = patch.aiDeepAnalysisResults;
  if (typeof patch.aiAnalysisComplete !== "undefined") s.aiAnalysisComplete = patch.aiAnalysisComplete;
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
