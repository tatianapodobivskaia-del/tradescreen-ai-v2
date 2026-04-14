// @ts-nocheck
/**
 * pdfjs-dist 5.6+ expects modern runtime APIs that may be missing in Safari / older browsers:
 * - Map.prototype.getOrInsertComputed
 * - Promise.withResolvers
 */
if (typeof Promise !== "undefined" && typeof Promise.withResolvers !== "function") {
  (Promise as unknown as { withResolvers: <T>() => { promise: Promise<T>; resolve: (v: T | PromiseLike<T>) => void; reject: (r?: unknown) => void } }).withResolvers =
    function <T>() {
      let resolve!: (v: T | PromiseLike<T>) => void;
      let reject!: (r?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
}

if (typeof Map !== "undefined" && typeof Map.prototype.getOrInsertComputed !== "function") {
    (
      Map.prototype as Map<unknown, unknown> & {
        getOrInsertComputed: (key: unknown, callback: () => unknown) => unknown;
      }
    ).getOrInsertComputed = function (
      this: Map<unknown, unknown>,
      key: unknown,
      callback: () => unknown
    ) {
      if (!this.has(key)) {
        this.set(key, callback());
      }
      return this.get(key);
    };
}
