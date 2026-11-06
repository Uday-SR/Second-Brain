import { useEffect, useState } from "react";
import { aiService } from "./api";
import { AI_TYPES } from "./content";

export function useAiTypes(): { types: Set<string>; online: boolean | null; recheck: () => void } {
  const [types, setTypes] = useState<Set<string>>(AI_TYPES);
  const [online, setOnline] = useState<boolean | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setOnline(null);
    aiService
      .get<{ supported: string[] }>("/content/types", { timeout: 6000 })
      .then((res) => {
        if (cancelled) return;
        setTypes(new Set(res.data.supported));
        setOnline(true);
      })
      .catch(() => {
        if (!cancelled) setOnline(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { types, online, recheck: () => setTick((t) => t + 1) };
}
