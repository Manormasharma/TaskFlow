"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "@/lib/api";

interface State<T> {
  data: T | null;
  error: string;
  loading: boolean;
}

// Loads data on mount (and whenever `fetcher` changes). Pass a memoized `fetcher`.
export function useResource<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: null, error: "", loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => !cancelled && setState({ data, error: "", loading: false }))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setState((s) => ({ ...s, error: errorMessage(err, "Could not load data."), loading: false })),
      );
    return () => {
      cancelled = true;
    };
  }, [fetcher, tick]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, error: "", loading: true }));
    setTick((t) => t + 1);
  }, []);

  // Patch local data after a mutation so the UI updates without a refetch.
  const mutate = useCallback((update: (data: T) => T) => {
    setState((s) => (s.data === null ? s : { ...s, data: update(s.data) }));
  }, []);

  return { ...state, reload, mutate };
}
