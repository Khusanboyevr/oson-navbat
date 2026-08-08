/**
 * Deterministic thousands-grouping formatter (space-separated, matching Uzbek convention).
 *
 * Deliberately avoids `Number.prototype.toLocaleString("uz-UZ")` / `Intl.NumberFormat("uz-UZ")`:
 * Node's bundled small-icu data formats "uz-UZ" differently server-side than browsers do
 * client-side, which causes React hydration mismatches on any SSR'd page showing a price.
 */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
