/**
 * Tiny `cn` utility — concatenates classNames, skipping falsy values.
 * No clsx dep needed for this scale.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
