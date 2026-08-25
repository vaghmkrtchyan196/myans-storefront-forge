import { supabase } from "@/integrations/supabase/client";
import { pickImageUrl, resolveStorageUrls } from "@/lib/images";
import type { Product, ProductImage, ProductSize, Taxonomy } from "@/lib/types";

type RawProduct = Omit<Product, "images" | "sizes"> & {
  product_images: Omit<ProductImage, "displayUrl">[] | null;
  product_sizes: ProductSize[] | null;
};

const PRODUCT_SELECT =
  "id,name,description,price_amd,color,category_id,collection_id,is_available,sort_order,created_at,updated_at,product_images(id,product_id,url,storage_path,position,is_main),product_sizes(id,product_id,size,is_available)";

async function hydrate(rows: RawProduct[]): Promise<Product[]> {
  const signed = await resolveStorageUrls(
    rows.flatMap((row) => (row.product_images ?? []).map((img) => img.storage_path)),
  );

  return rows.map((row) => ({
    ...row,
    images: (row.product_images ?? [])
      .slice()
      .sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.position - b.position)
      .map((img) => ({ ...img, displayUrl: pickImageUrl(img.url, img.storage_path, signed) })),
    sizes: (row.product_sizes ?? [])
      .slice()
      .sort((a, b) => a.size.localeCompare(b.size)),
  }));
}

export type ProductFilters = {
  search?: string;
  availability?: "all" | "available" | "unavailable";
  categoryId?: string | "all";
  collectionId?: string | "all";
  sort?: "newest" | "price_asc" | "price_desc" | "name";
};

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase.from("products").select(PRODUCT_SELECT);

  if (filters.search?.trim()) query = query.ilike("name", `%${filters.search.trim()}%`);
  if (filters.availability === "available") query = query.eq("is_available", true);
  if (filters.availability === "unavailable") query = query.eq("is_available", false);
  if (filters.categoryId && filters.categoryId !== "all")
    query = query.eq("category_id", filters.categoryId);
  if (filters.collectionId && filters.collectionId !== "all")
    query = query.eq("collection_id", filters.collectionId);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price_amd", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_amd", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return hydrate((data ?? []) as unknown as RawProduct[]);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [product] = await hydrate([data as unknown as RawProduct]);
  return product ?? null;
}

export async function fetchCategories(): Promise<Taxonomy[]> {
  const { data, error } = await supabase.from("categories").select("id,name,slug").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchCollections(): Promise<Taxonomy[]> {
  const { data, error } = await supabase.from("collections").select("id,name,slug").order("name");
  if (error) throw error;
  return data ?? [];
}
