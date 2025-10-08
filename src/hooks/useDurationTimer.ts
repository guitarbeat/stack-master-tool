import { useState, useEffect } from "react";

/**
 * Hook for formatting duration between two timestamps
 * @param startTime - Start timestamp (Date object)
 * @param updateInterval - How often to update (ms), default 1000ms
 * @returns Formatted duration string (e.g., "2m 30s", "45s")
 */
export function useDurationTimer(
  startTime: Date | null,
  updateInterval: number = 1000,
): string {
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (!startTime) {
      setDuration("");
      return;
    }

    const updateDuration = () => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setDuration(`${minutes}m ${seconds}s`);
      } else {
        setDuration(`${seconds}s`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, updateInterval);
    return () => clearInterval(interval);
  }, [startTime, updateInterval]);

  return duration;
}
