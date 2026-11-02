
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  calculateLoadingPrediction,
  getLoadingHistory,
  getLoadingHistoryKey,
  recordLoadingDuration,
} from "@/lib/loadingPrediction";

interface UseLoadingPredictionOptions {
  isInitializing: boolean;
  hasError: boolean;
}

export interface LoadingPredictionState {
  elapsedSeconds: number;
  estimatedRemainingSeconds: number | null;
  predictedTotalSeconds: number | null;
  isOverEstimate: boolean;
  hasPrediction: boolean;
}

/**
 * Track and predict frontend initialization time.
 *
 * Args:
 *     options (UseLoadingPredictionOptions):
 *         Initialization loading and error states.
 *
 * Returns:
 *     LoadingPredictionState: Current timing estimate.
 */
export function useLoadingPrediction({
  isInitializing,
  hasError,
}: UseLoadingPredictionOptions): LoadingPredictionState {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";

  const storageKey = getLoadingHistoryKey(
    backendUrl
  );

  // Capture the first render of this page instance.
  const [startedAt] = useState(
    () => performance.now()
  );

  const [elapsedMs, setElapsedMs] = useState(0);

  const [
    predictedTotalMs,
    setPredictedTotalMs,
  ] = useState<number | null>(null);

  // Prevent duplicate measurements.
  const completedRef = useRef(false);

  /*
   * Read the previous successful measurements.
   *
   * This runs in the browser, not during
   * server-side rendering.
   */
  useEffect(() => {
    const history = getLoadingHistory(
      storageKey
    );

    const prediction =
      calculateLoadingPrediction(history);

    setPredictedTotalMs(prediction);
  }, [storageKey]);

  /*
   * Update the elapsed duration while
   * initialization is still running.
   */
  useEffect(() => {
    if (!isInitializing) {
      return;
    }

    const updateElapsed = () => {
      setElapsedMs(
        performance.now() - startedAt
      );
    };

    updateElapsed();

    const intervalId = window.setInterval(
      updateElapsed,
      1000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isInitializing, startedAt]);

  /*
   * Record initialization duration only once,
   * after both requests have finished.
   *
   * Failed initializations are excluded.
   */
  useEffect(() => {
    if (
      isInitializing ||
      completedRef.current
    ) {
      return;
    }

    completedRef.current = true;

    const durationMs =
      performance.now() - startedAt;

    setElapsedMs(durationMs);

    if (hasError) {
      return;
    }

    recordLoadingDuration(
      storageKey,
      durationMs
    );

    if (process.env.NODE_ENV === "development") {
      console.info(
        "[Loading Prediction] Successful initialization:",
        {
          durationMs: Math.round(durationMs),
          predictedMs:
            predictedTotalMs === null
              ? null
              : Math.round(predictedTotalMs),
        }
      );
    }
  }, [
    isInitializing,
    hasError,
    startedAt,
    storageKey,
    predictedTotalMs,
  ]);

  const hasPrediction =
    predictedTotalMs !== null;

  const isOverEstimate =
    predictedTotalMs !== null &&
    elapsedMs >= predictedTotalMs;

  const remainingMs =
    predictedTotalMs === null
      ? null
      : Math.max(
          0,
          predictedTotalMs - elapsedMs
        );

  return {
    elapsedSeconds: Math.floor(
      elapsedMs / 1000
    ),

    estimatedRemainingSeconds:
      remainingMs === null
        ? null
        : Math.ceil(remainingMs / 1000),

    predictedTotalSeconds:
      predictedTotalMs === null
        ? null
        : Math.ceil(predictedTotalMs / 1000),

    isOverEstimate,
    hasPrediction,
  };
}
