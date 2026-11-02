
const HISTORY_LIMIT = 5;
const MIN_SAMPLES = 3;
const MAX_VALID_DURATION_MS = 600_000;

export interface LoadingHistory {
  durations: number[];
}

/**
 * Build a storage key for the configured backend.
 *
 * Args:
 *     backendUrl (string): Configured API base URL.
 *
 * Returns:
 *     string: Browser storage key.
 */
export function getLoadingHistoryKey(
  backendUrl: string
): string {
  const normalizedUrl = backendUrl
    .trim()
    .replace(/\/+$/, "");

  return `mcp-playground:loading-history:v1:${encodeURIComponent(
    normalizedUrl
  )}`;
}

/**
 * Validate a recorded initialization duration.
 *
 * Args:
 *     durationMs (number): Duration in milliseconds.
 *
 * Returns:
 *     boolean: Whether the duration is valid.
 */
function isValidDuration(
  durationMs: number
): boolean {
  return (
    Number.isFinite(durationMs) &&
    durationMs > 0 &&
    durationMs <= MAX_VALID_DURATION_MS
  );
}

/**
 * Read historical loading durations from localStorage.
 *
 * Args:
 *     storageKey (string): History storage key.
 *
 * Returns:
 *     number[]: Valid recorded durations.
 */
export function getLoadingHistory(
  storageKey: string
): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(
      storageKey
    );

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("durations" in parsed) ||
      !Array.isArray(parsed.durations)
    ) {
      return [];
    }

    return parsed.durations
      .filter(
        (duration: unknown): duration is number =>
          typeof duration === "number" &&
          isValidDuration(duration)
      )
      .slice(-HISTORY_LIMIT);
  } catch {
    return [];
  }
}

/**
 * Calculate the historical moving average.
 *
 * Args:
 *     durations (number[]): Previous durations.
 *
 * Returns:
 *     number | null: Predicted duration in milliseconds,
 *         or null when there is insufficient history.
 */
export function calculateLoadingPrediction(
  durations: number[]
): number | null {
  const validDurations = durations
    .filter(isValidDuration)
    .slice(-HISTORY_LIMIT);

  if (validDurations.length < MIN_SAMPLES) {
    return null;
  }

  const total = validDurations.reduce(
    (sum, duration) => sum + duration,
    0
  );

  return total / validDurations.length;
}

/**
 * Record a successful initialization duration.
 *
 * Args:
 *     storageKey (string): History storage key.
 *     durationMs (number): Initialization duration.
 *
 * Returns:
 *     number[]: Updated history.
 */
export function recordLoadingDuration(
  storageKey: string,
  durationMs: number
): number[] {
  if (!isValidDuration(durationMs)) {
    return getLoadingHistory(storageKey);
  }

  const previous = getLoadingHistory(storageKey);

  const updated = [
    ...previous,
    durationMs,
  ].slice(-HISTORY_LIMIT);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          durations: updated,
        } satisfies LoadingHistory)
      );
    } catch {
      // Storage may be disabled or unavailable.
    }
  }

  return updated;
}
