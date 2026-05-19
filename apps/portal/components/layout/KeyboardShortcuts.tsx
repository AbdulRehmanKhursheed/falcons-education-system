'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  onOpenPalette: () => void;
  paletteOpen: boolean;
};

type GroupedShortcut = {
  group: string;
  items: Array<{ keys: string[]; label: string }>;
};

const cheatsheet: GroupedShortcut[] = [
  {
    group: 'Global',
    items: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['/'], label: 'Focus search palette' },
      { keys: ['?'], label: 'Show this cheatsheet' },
      { keys: ['Esc'], label: 'Close palette / dialog' },
    ],
  },
  {
    group: 'Go to…',
    items: [
      { keys: ['G', 'D'], label: 'Dashboard' },
      { keys: ['G', 'S'], label: 'Students' },
      { keys: ['G', 'A'], label: 'Admissions' },
      { keys: ['G', 'T'], label: 'Attendance' },
      { keys: ['G', 'F'], label: 'Fees' },
      { keys: ['G', 'E'], label: 'Assessments' },
    ],
  },
];

const gMap = new Map<string, string>([
  ['d', '/dashboard'],
  ['s', '/students'],
  ['a', '/admissions'],
  ['t', '/attendance'],
  ['f', '/fees'],
  ['e', '/assessments'],
]);

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Mounted once at the app shell. Owns:
 *  - Global hotkeys: Cmd/Ctrl+K, '/', '?'
 *  - Vim-style `g <key>` navigation prefix (800 ms window)
 *  - The `?` cheatsheet overlay
 *
 * Esc-to-close-palette is handled inside the palette itself; we still listen
 * to clear our own prefix state.
 */
export function KeyboardShortcuts({ onOpenPalette, paletteOpen }: Props) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  // Use a Map (per brief) keyed by 'g' to track the prefix + timer.
  const prefixState = useRef(new Map<string, number>());

  function clearPrefix() {
    const m = prefixState.current;
    const timer = m.get('timer');
    if (typeof timer === 'number') {
      window.clearTimeout(timer);
    }
    m.clear();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as EventTarget | null;
      const editable = isEditable(target);
      const key = e.key;
      const cmd = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+K — works even from inputs.
      if (cmd && (key === 'k' || key === 'K')) {
        e.preventDefault();
        clearPrefix();
        setHelpOpen(false);
        onOpenPalette();
        return;
      }

      // Anything below should not fire from inside an input.
      if (editable) return;

      // Modifier-bearing keys we don't handle elsewhere — ignore.
      if (e.altKey || (cmd && key.toLowerCase() !== 'k')) return;

      // Esc — clear our prefix and close help. Palette closes itself.
      if (key === 'Escape') {
        clearPrefix();
        setHelpOpen(false);
        return;
      }

      // '?' — open cheatsheet.
      if (key === '?') {
        e.preventDefault();
        clearPrefix();
        setHelpOpen(true);
        return;
      }

      // '/' — open palette (palette will auto-focus its input).
      if (key === '/') {
        if (paletteOpen) return;
        e.preventDefault();
        clearPrefix();
        setHelpOpen(false);
        onOpenPalette();
        return;
      }

      // Vim 'g <key>' prefix navigation.
      const lower = key.toLowerCase();
      if (prefixState.current.has('g')) {
        // Second key of the chord.
        const dest = gMap.get(lower);
        clearPrefix();
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (lower === 'g' && !e.shiftKey) {
        prefixState.current.set('g', Date.now());
        const timer = window.setTimeout(() => {
          clearPrefix();
        }, 800);
        prefixState.current.set('timer', timer);
        // Don't preventDefault — we want a real 'g' to be ignored cleanly.
        return;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearPrefix();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOpenPalette, paletteOpen, router]);

  return (
    <ShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
  );
}

function ShortcutsOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Close shortcuts"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-[480px] rounded-xl border border-line bg-surface shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-line-soft">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-4 h-4 text-ink-soft" strokeWidth={1.75} />
            <h2
              className="font-display text-[18px] text-ink"
              style={{ fontVariationSettings: '"opsz" 22' }}
            >
              Keyboard shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink-soft transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto">
          {cheatsheet.map((section) => (
            <section
              key={section.group}
              className="border-t border-line-soft first:border-t-0"
            >
              <header className="px-5 pt-3 pb-1.5">
                <span className="eyebrow">{section.group}</span>
              </header>
              <ul className="pb-2">
                {section.items.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 px-5 py-1.5"
                  >
                    <span className="text-[12.5px] text-ink-soft">
                      {row.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {row.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className={cn(
                            'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded border border-line bg-surface-2',
                            'font-mono text-[10.5px] text-ink-soft',
                          )}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="flex items-center gap-3 px-5 py-2 border-t border-line-soft bg-surface-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
          <span>
            <kbd className="font-mono not-italic">?</kbd> toggle
          </span>
          <span>
            <kbd className="font-mono not-italic">esc</kbd> close
          </span>
        </footer>
      </div>
    </div>
  );
}
