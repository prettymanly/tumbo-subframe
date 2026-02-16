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
 */

// The project does not use generated Supabase types, so all clients are
// SupabaseClient<any, "public", any>. We accept any shape that has .from().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientLike = { from: (...args: any[]) => any };

/**
 * Returns a query builder scoped to visible classes only.
 * Chain additional filters, ordering, etc. on the returned builder.
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
 * Returns a HEAD-only count of visible classes (no row data transferred).
 *
 * @example
 *   const count = await visibleClassesCount(supabase);
 */
export async function visibleClassesCount(
  supabase: SupabaseClientLike
): Promise<number> {
  const { count } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);
  return count ?? 0;
}
