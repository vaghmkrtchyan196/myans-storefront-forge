import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/images";

export const HERO_IMAGE_KEY = "hero_image_path";

export async function fetchSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function fetchHeroImage(): Promise<{ path: string | null; url: string }> {
  const path = await fetchSetting(HERO_IMAGE_KEY);
  if (!path) return { path: null, url: "" };
  if (/^https?:\/\//.test(path)) return { path, url: path };
  return { path, url: await resolveStorageUrl(path) };
}

export async function saveSetting(key: string, value: string | null): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}
