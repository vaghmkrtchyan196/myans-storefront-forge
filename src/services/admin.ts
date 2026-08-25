import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_BUCKET } from "@/lib/images";
import type { Product } from "@/lib/types";

export type ProductInput = {
  name: string;
  description: string;
  price_amd: number;
  color: string;
  category_id: string | null;
  collection_id: string | null;
  is_available: boolean;
};

export async function createProduct(input: ProductInput, sizes: string[]): Promise<string> {
  const { data, error } = await supabase.from("products").insert(input).select("id").single();
  if (error) throw error;
  const id = data.id as string;
  await saveSizes(id, sizes);
  return id;
}

export async function updateProduct(id: string, input: ProductInput, sizes: string[]) {
  const { error } = await supabase.from("products").update(input).eq("id", id);
  if (error) throw error;
  await saveSizes(id, sizes);
}

export async function setAvailability(id: string, is_available: boolean) {
  const { error } = await supabase.from("products").update({ is_available }).eq("id", id);
  if (error) throw error;
}

export async function saveSizes(productId: string, sizes: string[]) {
  const { error: delError } = await supabase
    .from("product_sizes")
    .delete()
    .eq("product_id", productId);
  if (delError) throw delError;
  if (sizes.length === 0) return;
  const { error } = await supabase
    .from("product_sizes")
    .insert(sizes.map((size) => ({ product_id: productId, size, is_available: true })));
  if (error) throw error;
}

/** Deletes a product and cleans up its uploaded files so nothing is orphaned. */
export async function deleteProduct(product: Product) {
  const paths = product.images
    .map((image) => image.storage_path)
    .filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
  }
  const { error } = await supabase.from("products").delete().eq("id", product.id);
  if (error) throw error;
}

/** Copies a product (new id, copied images) so a similar item can be made fast. */
export async function duplicateProduct(product: Product): Promise<string> {
  const newId = await createProduct(
    {
      name: `${product.name} (կրկնօրինակ)`,
      description: product.description,
      price_amd: product.price_amd,
      color: product.color,
      category_id: product.category_id,
      collection_id: product.collection_id,
      is_available: product.is_available,
    },
    product.sizes.map((size) => size.size),
  );

  for (const image of product.images) {
    if (!image.storage_path) continue;
    const target = `${newId}/${crypto.randomUUID()}-${image.storage_path.split("/").pop()}`;
    const { error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .copy(image.storage_path, target);
    if (error) continue;
    await supabase.from("product_images").insert({
      product_id: newId,
      url: "",
      storage_path: target,
      position: image.position,
      is_main: image.is_main,
    });
  }

  return newId;
}

export async function uploadProductImage(productId: string, file: File): Promise<void> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error: rowError } = await supabase.from("product_images").insert({
    product_id: productId,
    url: "",
    storage_path: path,
    position: count ?? 0,
    is_main: (count ?? 0) === 0,
  });
  if (rowError) throw rowError;
}

export async function deleteProductImage(imageId: string, storagePath: string | null) {
  if (storagePath) await supabase.storage.from(PRODUCT_BUCKET).remove([storagePath]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
}

export async function setMainImage(productId: string, imageId: string) {
  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_main: false })
    .eq("product_id", productId);
  if (clearError) throw clearError;
  const { error } = await supabase
    .from("product_images")
    .update({ is_main: true })
    .eq("id", imageId);
  if (error) throw error;
}

export async function reorderImages(ordered: { id: string; position: number }[]) {
  for (const item of ordered) {
    const { error } = await supabase
      .from("product_images")
      .update({ position: item.position })
      .eq("id", item.id);
    if (error) throw error;
  }
}

export async function uploadHeroImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `hero/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

/** Replaces one image file in place, keeping its position and main flag. */
export async function replaceProductImage(
  imageId: string,
  productId: string,
  oldPath: string | null,
  file: File,
) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  const { error: rowError } = await supabase
    .from("product_images")
    .update({ storage_path: path, url: "" })
    .eq("id", imageId);
  if (rowError) throw rowError;
  if (oldPath) await supabase.storage.from(PRODUCT_BUCKET).remove([oldPath]);
}

export type DashboardStats = {
  productCount: number;
  availableCount: number;
  unavailableCount: number;
  newOrders: number;
  totalOrders: number;
  totalSales: number;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [products, available, orders] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_available", true),
    supabase.from("orders").select("status,total_amd"),
  ]);

  if (orders.error) throw orders.error;
  const rows = (orders.data ?? []) as { status: string; total_amd: number }[];
  const productCount = products.count ?? 0;
  const availableCount = available.count ?? 0;

  return {
    productCount,
    availableCount,
    unavailableCount: Math.max(productCount - availableCount, 0),
    newOrders: rows.filter((row) => row.status === "new").length,
    totalOrders: rows.length,
    totalSales: rows
      .filter((row) => row.status !== "cancelled")
      .reduce((sum, row) => sum + (row.total_amd ?? 0), 0),
  };
}

