import { supabase } from "@/integrations/supabase/client";
import type { CartLine, Order, OrderItem, OrderStatus } from "@/lib/types";

export type CheckoutInput = {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  subtotal_amd: number;
  shipping_amd: number;
  total_amd: number;
  lines: CartLine[];
};

/**
 * Creates an order and snapshots the price of each line at purchase time.
 * Payment providers can be plugged in here later without touching the UI.
 */
export async function createOrder(input: CheckoutInput): Promise<string> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      city: input.city,
      address: input.address,
      notes: input.notes || null,
      subtotal_amd: input.subtotal_amd,
      shipping_amd: input.shipping_amd,
      total_amd: input.total_amd,
    })
    .select("id")
    .single();
  if (error) throw error;

  const orderId = data.id as string;
  const { error: itemsError } = await supabase.from("order_items").insert(
    input.lines.map((line) => ({
      order_id: orderId,
      product_id: line.productId,
      product_name: line.name,
      size: line.size,
      quantity: line.quantity,
      unit_price_amd: line.price_amd,
      image_url: line.imagePath ?? null,
    })),
  );
  if (itemsError) throw itemsError;

  return orderId;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,customer_name,phone,city,address,notes,subtotal_amd,shipping_amd,total_amd,status,created_at,order_items(id,order_id,product_id,product_name,size,quantity,unit_price_amd,image_url)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const { order_items, ...rest } = row as typeof row & { order_items: OrderItem[] | null };
    return { ...(rest as unknown as Omit<Order, "items">), items: order_items ?? [] };
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
