import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatAmd } from "@/lib/format";
import { SIZE_OPTIONS } from "@/lib/types";
import type { Product } from "@/lib/types";
import { fetchCategories, fetchCollections } from "@/services/products";
import type { ProductInput } from "@/services/admin";

export type ProductFormValues = ProductInput & { sizes: string[] };

export function toFormValues(product?: Product | null): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price_amd: product?.price_amd ?? 0,
    color: product?.color ?? "",
    category_id: product?.category_id ?? null,
    collection_id: product?.collection_id ?? null,
    is_available: product?.is_available ?? true,
    sizes: product?.sizes.map((size) => size.size) ?? [],
  };
}

export function ProductForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  children,
}: {
  values: ProductFormValues;
  onChange: (values: ProductFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  children?: React.ReactNode;
}) {
  const [priceText, setPriceText] = useState(values.price_amd ? String(values.price_amd) : "");
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const collections = useQuery({ queryKey: ["collections"], queryFn: fetchCollections });

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Անվանում</Label>
        <Input
          id="name"
          className="h-12"
          value={values.name}
          maxLength={120}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Գին (֏)</Label>
        <Input
          id="price"
          className="h-12"
          type="number"
          inputMode="numeric"
          min={0}
          value={priceText}
          onChange={(e) => {
            setPriceText(e.target.value);
            set("price_amd", Math.max(0, Math.round(Number(e.target.value) || 0)));
          }}
        />
        <p className="text-xs text-muted-foreground">{formatAmd(values.price_amd)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Գույն</Label>
        <Input
          id="color"
          className="h-12"
          value={values.color}
          maxLength={60}
          onChange={(e) => set("color", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Չափսեր</Label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => {
            const active = values.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  set(
                    "sizes",
                    active ? values.sizes.filter((s) => s !== size) : [...values.sizes, size],
                  )
                }
                className={`h-12 min-w-14 border px-4 text-sm font-medium ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Նկարագրություն</Label>
        <Textarea
          id="description"
          rows={5}
          value={values.description}
          maxLength={2000}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Կատեգորիա</Label>
          <select
            id="category"
            className="h-12 w-full border border-input bg-background px-3 text-sm"
            value={values.category_id ?? ""}
            onChange={(e) => set("category_id", e.target.value || null)}
          >
            <option value="">— Ընտրել —</option>
            {(categories.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="collection">Հավաքածու</Label>
          <select
            id="collection"
            className="h-12 w-full border border-input bg-background px-3 text-sm"
            value={values.collection_id ?? ""}
            onChange={(e) => set("collection_id", e.target.value || null)}
          >
            <option value="">— Ընտրել —</option>
            {(collections.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border border-border p-4">
        <div>
          <p className="text-sm font-medium">Առկայություն</p>
          <p className="text-xs text-muted-foreground">
            {values.is_available ? "🟢 Առկա է" : "🔴 Առկա չէ"}
          </p>
        </div>
        <Switch
          checked={values.is_available}
          onCheckedChange={(checked) => set("is_available", checked)}
        />
      </div>

      {children}

      <Button type="submit" className="h-12 w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Պահպանվում է…" : submitLabel}
      </Button>
    </form>
  );
}
