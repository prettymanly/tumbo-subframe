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
 * Returns the count of visible listings after provider deduplication.
 * Since many providers have multiple class rows (category splits from ingestion),
 * this counts distinct provider_ids to reflect the actual card count in the UI.
 *
 * @example
 *   const count = await visibleClassesCount(supabase);
 */
export async function visibleClassesCount(
  supabase: SupabaseClientLike
): Promise<number> {
  // Count distinct providers (each provider_id = one card after dedup)
  // plus any classes without a provider_id (should be 0 for visible set)
  const { data } = await supabase
    .from("classes")
    .select("provider_id")
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);
  if (!data) return 0;
  const uniqueProviders = new Set(
    (data as { provider_id: string | null }[]).map((r) => r.provider_id ?? r)
  );
  return uniqueProviders.size;
}
