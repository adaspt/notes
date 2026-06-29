import { useEffect, useState } from "react";
import { endOfToday } from "./task-filters";

// Fire just after midnight (not exactly on it) so endOfToday() reliably lands on the new day.
const MIDNIGHT_GUARD_MS = 50;

function nextLocalMidnight(now: Date) {
  const midnight = new Date(now);
  midnight.setDate(now.getDate() + 1);
  midnight.setHours(0, 0, 0, MIDNIGHT_GUARD_MS);
  return midnight;
}

/**
 * The end-of-today instant used to split tasks into Today vs Later, refreshed when the
 * local day rolls over. A timer handles the rollover while the app stays open; focus and
 * visibility events cover the case where a timer was throttled/skipped (sleep, background
 * tab) and the day changed in the meantime.
 */
export function useTodayBoundary() {
  const [boundary, setBoundary] = useState(() => endOfToday());

  useEffect(() => {
    // Only produces a new value when the day actually changed, so same-day focus/visibility
    // events keep a stable boundary reference and don't churn downstream transforms.
    const refreshBoundary = () => {
      setBoundary((current) => {
        const next = endOfToday();
        return current.getTime() === next.getTime() ? current : next;
      });
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        refreshBoundary();
      }
    };

    const now = new Date();
    const delay = Math.max(0, nextLocalMidnight(now).getTime() - now.getTime());
    const timeout = window.setTimeout(refreshBoundary, delay);

    window.addEventListener("focus", refreshBoundary);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("focus", refreshBoundary);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
    // Depends on `boundary`: each rollover re-runs the effect to schedule the next midnight.
  }, [boundary]);

  return boundary;
}
