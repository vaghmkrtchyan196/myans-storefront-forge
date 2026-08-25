import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_BUCKET = "product-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

const cache = new Map<string, { url: string; expires: number }>();

/**
 * Product files live in a private bucket, so displayable links are signed
 * on demand and cached in memory for the lifetime of the page.
 */
export async function resolveStorageUrls(
  paths: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const now = Date.now();
  const unique = Array.from(
    new Set(paths.filter((p): p is string => typeof p === "string" && p.length > 0)),
  );
  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const path of unique) {
    const hit = cache.get(path);
    if (hit && hit.expires > now) result[path] = hit.url;
    else missing.push(path);
  }

  if (missing.length > 0) {
    const { data } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .createSignedUrls(missing, SIGNED_URL_TTL);
    for (const entry of data ?? []) {
      if (entry.signedUrl && entry.path) {
        cache.set(entry.path, {
          url: entry.signedUrl,
          expires: now + (SIGNED_URL_TTL - 300) * 1000,
        });
        result[entry.path] = entry.signedUrl;
      }
    }
  }

  return result;
}

export async function resolveStorageUrl(path: string | null | undefined): Promise<string> {
  if (!path) return "";
  const map = await resolveStorageUrls([path]);
  return map[path] ?? "";
}

/** Picks a displayable URL: explicit external URL wins, otherwise the signed one. */
export function pickImageUrl(
  url: string | null | undefined,
  storagePath: string | null | undefined,
  signed: Record<string, string>,
): string {
  if (url && /^https?:\/\//.test(url)) return url;
  if (storagePath) return signed[storagePath] ?? "";
  return "";
}
