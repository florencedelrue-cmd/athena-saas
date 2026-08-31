"use client";

import { useEffect, useRef } from "react";

interface DebouncedSaveOptions {
  delay?: number;
  enabled?: boolean;
  skipInitial?: boolean;
}

/** Slaat automatisch op na een korte pauze tijdens typen. */
export function useDebouncedSave<T>(
  value: T,
  save: (value: T) => void | Promise<void>,
  options: DebouncedSaveOptions = {}
) {
  const { delay = 600, enabled = true, skipInitial = true } = options;
  const isFirst = useRef(true);
  const saveRef = useRef(save);

  saveRef.current = save;

  useEffect(() => {
    if (!enabled) return;

    if (skipInitial && isFirst.current) {
      isFirst.current = false;
      return;
    }

    const timer = setTimeout(() => {
      void saveRef.current(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, enabled, skipInitial]);
}
