'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SidebarContent } from './Sidebar';
import type { AppRole } from '@/lib/auth-helpers';

type Props = {
  open: boolean;
  onClose: () => void;
  role: AppRole;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
};

/**
 * Slide-in drawer for screens narrower than lg. Renders the same nav
 * content as the desktop sidebar via <SidebarContent />.
 *
 * Behaviour:
 *  - Open: slides in from the left with backdrop fade
 *  - Close on: backdrop tap, ESC key, route change, link tap, swipe-left,
 *    close button
 *  - Focus moves to the close button on open
 *  - Body scroll is locked while open
 */
export function MobileNav({
  open,
  onClose,
  role,
  userName,
  userEmail,
  signOutAction,
}: Props) {
  const pathname = usePathname();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ESC to close + body scroll lock + focus the close button
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the close button shortly after mount
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1.5px]"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.2, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -300) onClose();
            }}
            className="absolute inset-y-0 left-0 w-[280px] max-w-[85%] bg-surface border-r border-line flex flex-col shadow-2xl"
          >
            {/* Close button — pinned top-right of the drawer */}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-md text-ink-soft hover:bg-surface-3 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>

            <SidebarContent
              role={role}
              userName={userName}
              userEmail={userEmail}
              signOutAction={signOutAction}
              onNavigate={onClose}
            />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
