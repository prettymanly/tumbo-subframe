/**
 * Centralized Supabase query helpers for the "classes" table.
 *
 * INVARIANT: Any surface a user can browse must only operate on the
 * "visible" dataset. This module enforces:
 *   - is_placeholder = false
 *   - hidden_from_directory = false
 *
 * All browse/listing/filter queries MUST use visibleClassesQuery() or
 * visibleClassesCount(). Direct .from("classes") is reserved for:
 *   - Single-ID lookups (e.g., /classes/[id] detail page)
 *   - Admin/internal tooling
 *   - Total stats (intentionally unfiltered)
 *
 * If you need to add a new visibility column (e.g., listing_eligibility),
 * add it here once and all consumers inherit it.
 *
 * NOTE: PostgREST has a server-side max-rows cap (default 1000).
 * Use fetchAllVisibleClasses() when you need the full dataset.
 */

// The project does not use generated Supabase types, so all clients are
// SupabaseClient<any, "public", any>. We accept any shape that has .from().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientLike = { from: (...args: any[]) => any };

const PAGE_SIZE = 1000;

/**
 * Returns a query builder scoped to visible classes only.
 * Chain additional filters, ordering, etc. on the returned builder.
 *
 * IMPORTANT: PostgREST caps results at 1000 rows by default.
 * If you need ALL rows, use fetchAllVisibleClasses() instead.
 *
 * @example
 *   const { data } = await visibleClassesQuery(supabase)
 *     .order("google_rating", { ascending: false })
 *     .limit(100);
 */
export function visibleClassesQuery(supabase: SupabaseClientLike) {
  return supabase
    .from("classes")
    .select("*")
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);
}

/**
 * Fetches ALL visible classes, paginating past PostgREST's max-rows cap.
 * Use this in any context that needs the full dataset (rails, browse grid, etc.).
 */
export async function fetchAllVisibleClasses<T = Record<string, unknown>>(
  supabase: SupabaseClientLike,
  select = "*"
): Promise<T[]> {
  const allRows: T[] = [];
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from("classes")
      .select(select)
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false)
      .range(from, from + PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    allRows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return allRows;
}

/**
 * Returns the count of visible listings after provider deduplication.
 * Since many providers have multiple class rows (category splits from ingestion),
 * this counts distinct provider_ids to reflect the actual card count in the UI.
 */
export async function visibleClassesCount(
  supabase: SupabaseClientLike
): Promise<number> {
  const rows = await fetchAllVisibleClasses<{ provider_id: string | null }>(
    supabase,
    "provider_id"
  );
  const uniqueProviders = new Set(rows.map((r) => r.provider_id ?? r));
  return uniqueProviders.size;
}
