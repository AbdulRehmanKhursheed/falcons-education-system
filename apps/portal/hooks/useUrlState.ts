'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Read + write URL search params from a client component.
 *
 * - `get(key)` returns the current string value (or '' if absent).
 * - `set({ ... })` issues a `router.replace` with the new search params
 *   merged in. Pass `null` (or '') to a key to remove it.
 *
 * History is replaced (not pushed) and scroll position is preserved, which
 * matches the behavior expected by power users tweaking filters.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const snapshot = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  const get = useCallback(
    (key: string, fallback = '') => snapshot[key] ?? fallback,
    [snapshot],
  );

  const set = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { get, set, snapshot };
}
