/**
 * Formatting helpers used across the portal.
 */

export function formatPKR(amount: number): string {
  if (Number.isNaN(amount)) return '—';
  // 'en-PK' formatter uses lakh grouping (1,23,456). We use 'en-IN' which is
  // identical for grouping but more consistent across browsers.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-PK', options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(iso);
}
