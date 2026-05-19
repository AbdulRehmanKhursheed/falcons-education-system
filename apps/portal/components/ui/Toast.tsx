'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

// ── Public types ─────────────────────────────────────────────────────────

export type ToastKind = 'success' | 'error' | 'info';

export type ToastInput = {
  kind?: ToastKind;
  title: string;
  description?: string;
  /** Time in ms before auto-dismiss. Defaults: 4500 (success/info), 8000 (error). */
  duration?: number;
};

type ToastEntry = Required<Pick<ToastInput, 'title'>> & {
  id: string;
  kind: ToastKind;
  description?: string;
  duration: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;

// ── Provider ──────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (input: ToastInput): string => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const kind: ToastKind = input.kind ?? 'info';
      const duration =
        input.duration ?? (kind === 'error' ? 8000 : 4500);

      setToasts((prev) => {
        const next = [...prev, { id, kind, title: input.title, description: input.description, duration }];
        // Drop oldest when exceeding the cap.
        if (next.length > MAX_VISIBLE) {
          const dropped = next.slice(0, next.length - MAX_VISIBLE);
          for (const d of dropped) {
            const handle = timers.current.get(d.id);
            if (handle) {
              clearTimeout(handle);
              timers.current.delete(d.id);
            }
          }
          return next.slice(-MAX_VISIBLE);
        }
        return next;
      });

      if (duration > 0) {
        const handle = setTimeout(() => dismissToast(id), duration);
        timers.current.set(id, handle);
      }
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const handle of map.values()) clearTimeout(handle);
      map.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

// ── Viewport ──────────────────────────────────────────────────────────────

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="no-print fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ width: '320px' }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Single toast ──────────────────────────────────────────────────────────

const kindStyles: Record<
  ToastKind,
  { wrap: string; iconWrap: string; Icon: typeof CheckCircle2; titleClass: string }
> = {
  success: {
    wrap: 'border-success/40 bg-success-soft',
    iconWrap: 'text-success',
    Icon: CheckCircle2,
    titleClass: 'text-success',
  },
  error: {
    wrap: 'border-danger/40 bg-danger-soft',
    iconWrap: 'text-danger',
    Icon: AlertTriangle,
    titleClass: 'text-danger',
  },
  info: {
    wrap: 'border-info/40 bg-info-soft',
    iconWrap: 'text-info',
    Icon: Info,
    titleClass: 'text-info',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastEntry;
  onDismiss: (id: string) => void;
}) {
  const styles = kindStyles[toast.kind];
  const labelId = useId();
  const descId = useId();
  const { Icon } = styles;

  return (
    <motion.div
      role="status"
      aria-labelledby={labelId}
      aria-describedby={toast.description ? descId : undefined}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'pointer-events-auto rounded-md border bg-surface shadow-[var(--shadow-float)]',
        'flex items-start gap-3 px-3.5 py-3',
        styles.wrap,
      )}
    >
      <span className={cn('mt-0.5 shrink-0', styles.iconWrap)}>
        <Icon className="w-4 h-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          id={labelId}
          className={cn(
            'font-semibold text-[12.5px] leading-snug tracking-tight',
            styles.titleClass,
          )}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p id={descId} className="mt-0.5 text-[12px] text-ink-soft leading-snug">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 -mr-1 -mt-1 p-1 rounded text-ink-faint hover:text-ink hover:bg-surface-3 transition-colors"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </motion.div>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() must be used within a <ToastProvider>');
  }
  return ctx;
}

/**
 * Safe variant for components that may render outside a ToastProvider. Returns
 * a no-op showToast when there's no provider so we don't crash unmounted UI.
 */
export function useOptionalToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return {
    showToast: () => '',
    dismissToast: () => {},
  };
}
