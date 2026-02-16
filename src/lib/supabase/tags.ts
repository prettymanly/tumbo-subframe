import { createClient } from "@supabase/supabase-js";
import { DBClass, Provider } from "../types/tags";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Classes ──

/** Fetch all enriched (non-placeholder, not hidden) classes */
export async function getEnrichedClasses(): Promise<DBClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching enriched classes:", error);
    return [];
  }
  return data || [];
}

/** Fetch a single class by ID, with provider data joined */
export async function getClassById(
  id: string
): Promise<(DBClass & { provider?: Provider }) | null> {
  // Fetch class
  const { data: cls, error: clsErr } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();

  if (clsErr || !cls) {
    console.error("Error fetching class:", clsErr);
    return null;
  }
  if (cls.hidden_from_directory) return null;

  // Fetch provider if linked
  if (cls.provider_id) {
    const { data: provider } = await supabase
      .from("providers")
      .select("*")
      .eq("id", cls.provider_id)
      .single();

    return { ...cls, provider: provider || undefined };
  }

  return cls;
}

/** Fetch classes by category */
export async function getClassesByCategory(
  category: string
): Promise<DBClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("category", category)
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false)
    .order("google_rating", { ascending: false });

  if (error) {
    console.error("Error fetching by category:", error);
    return [];
  }
  return data || [];
}

/** Fetch all classes for a given provider */
export async function getClassesByProvider(
  providerId: string
): Promise<DBClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("provider_id", providerId)
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching provider classes:", error);
    return [];
  }
  return data || [];
}

// ── Providers ──

/** Fetch a single provider by ID */
export async function getProviderById(
  id: string
): Promise<Provider | null> {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching provider:", error);
    return null;
  }
  return data;
}

/** Fetch all providers that have enriched classes */
export async function getProvidersWithClasses(): Promise<
  (Provider & { class_count: number })[]
> {
  // Get unique provider_ids from enriched classes
  const { data: classes } = await supabase
    .from("classes")
    .select("provider_id")
    .eq("is_placeholder", false)
    .not("provider_id", "is", null);

  if (!classes || classes.length === 0) return [];

  const providerIds = [...new Set(classes.map((c) => c.provider_id))];
  const countMap: Record<string, number> = {};
  classes.forEach((c) => {
    if (c.provider_id) {
      countMap[c.provider_id] = (countMap[c.provider_id] || 0) + 1;
    }
  });

  const { data: providers } = await supabase
    .from("providers")
    .select("*")
    .in("id", providerIds)
    .order("name", { ascending: true });

  if (!providers) return [];

  return providers.map((p) => ({
    ...p,
    class_count: countMap[p.id] || 0,
  }));
}

// ── Stats ──

export async function getStats(): Promise<{
  classes: number;
  providers: number;
  enriched: number;
}> {
  const [classRes, providerRes, enrichedRes] = await Promise.all([
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("providers").select("id", { count: "exact", head: true }),
    supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false),
  ]);

  return {
    classes: classRes.count || 0,
    providers: providerRes.count || 0,
    enriched: enrichedRes.count || 0,
  };
}

/** Get distinct categories from enriched classes */
export async function getCategories(): Promise<string[]> {
  const { data } = await supabase
    .from("classes")
    .select("category")
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false)
    .not("category", "is", null);

  if (!data) return [];
  return [...new Set(data.map((c) => c.category as string))].sort();
}
