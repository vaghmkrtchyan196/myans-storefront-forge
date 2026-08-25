export const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"] as const;
export type SizeOption = (typeof SIZE_OPTIONS)[number];

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  position: number;
  is_main: boolean;
  /** Resolved, displayable URL (signed when the file lives in storage). */
  displayUrl: string;
};

export type ProductSize = {
  id: string;
  product_id: string;
  size: string;
  is_available: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price_amd: number;
  color: string;
  category_id: string | null;
  collection_id: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  sizes: ProductSize[];
};

export type Taxonomy = { id: string; name: string; slug: string };

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipping"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Նոր",
  confirmed: "Հաստատված",
  preparing: "Պատրաստվում է",
  shipping: "Առաքվում է",
  completed: "Ավարտված",
  cancelled: "Չեղարկված",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price_amd: number;
  image_url: string | null;
};

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string | null;
  subtotal_amd: number;
  shipping_amd: number;
  total_amd: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
};

export type CartLine = {
  productId: string;
  name: string;
  size: string;
  price_amd: number;
  quantity: number;
  imagePath: string | null;
  imageUrl: string | null;
};

export const SHIPPING_AMD = 1000;
export const FREE_SHIPPING_THRESHOLD_AMD = 30000;
