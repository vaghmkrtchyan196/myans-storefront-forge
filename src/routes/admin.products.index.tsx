import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, Spinner } from "@/components/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatAmd } from "@/lib/format";
import type { Product } from "@/lib/types";
import { deleteProduct, duplicateProduct, setAvailability } from "@/services/admin";
import { fetchCategories, fetchProducts } from "@/services/products";
import type { ProductFilters } from "@/services/products";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({
    meta: [
      { title: "MYANS Ադմին — Ապրանքներ" },
      { name: "description", content: "MYANS խանութի ապրանքների կառավարում։" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "MYANS Ադմին — Ապրանքներ" },
      { property: "og:description", content: "MYANS խանութի ապրանքների կառավարում։" },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const [search, setSearch] = useState("");
  const [availability, setAvailability_] = useState<ProductFilters["availability"]>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<NonNullable<ProductFilters["sort"]>>("newest");
  const queryClient = useQueryClient();

  const filters: ProductFilters = { search, availability, categoryId, sort };
  const products = useQuery({
    queryKey: ["products", "admin", filters],
    queryFn: () => fetchProducts(filters),
  });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => setAvailability(id, value),
    onSuccess: () => {
      toast.success("Առկայությունը թարմացվեց։");
      void refresh();
    },
    onError: () => toast.error("Չհաջողվեց թարմացնել առկայությունը։"),
  });

  const remove = useMutation({
    mutationFn: (product: Product) => deleteProduct(product),
    onSuccess: () => {
      toast.success("Ապրանքը ջնջվեց։");
      void refresh();
    },
    onError: () => toast.error("Չհաջողվեց ջնջել ապրանքը։"),
  });

  const copy = useMutation({
    mutationFn: (product: Product) => duplicateProduct(product),
    onSuccess: () => {
      toast.success("Ապրանքը կրկնօրինակվեց։");
      void refresh();
    },
    onError: () => toast.error("Չհաջողվեց կրկնօրինակել։"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold md:text-2xl">Ապրանքներ</h1>
        <Button asChild className="h-12">
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Ավելացնել ապրանք
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          className="h-12"
          placeholder="Որոնել անվանումով…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-12 w-full border border-input bg-background px-3 text-sm"
          value={availability}
          onChange={(e) => setAvailability_(e.target.value as ProductFilters["availability"])}
        >
          <option value="all">Բոլորը</option>
          <option value="available">Առկա</option>
          <option value="unavailable">Առկա չէ</option>
        </select>
        <select
          className="h-12 w-full border border-input bg-background px-3 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="all">Բոլոր կատեգորիաները</option>
          {(categories.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className="h-12 w-full border border-input bg-background px-3 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as NonNullable<ProductFilters["sort"]>)}
        >
          <option value="newest">Նորերը սկզբում</option>
          <option value="price_asc">Գինը՝ աճող</option>
          <option value="price_desc">Գինը՝ նվազող</option>
          <option value="name">Անվանումով</option>
        </select>
      </div>

      {products.isLoading ? (
        <Spinner />
      ) : products.isError ? (
        <ErrorState />
      ) : (products.data ?? []).length === 0 ? (
        <EmptyState title="Ապրանքներ չեն գտնվել։" />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {(products.data ?? []).map((product) => (
            <li key={product.id} className="flex gap-4 py-4">
              <Link
                to="/admin/products/$productId"
                params={{ productId: product.id }}
                className="h-24 w-20 shrink-0 overflow-hidden bg-muted"
              >
                {product.images[0]?.displayUrl && (
                  <img
                    src={product.images[0].displayUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0">
                  <Link
                    to="/admin/products/$productId"
                    params={{ productId: product.id }}
                    className="block truncate text-sm font-medium"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatAmd(product.price_amd)}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sizes.map((size) => size.size).join(" · ") || "Չափսեր չկան"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.is_available}
                      onCheckedChange={(value) => toggle.mutate({ id: product.id, value })}
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.is_available ? "Առկա է" : "Առկա չէ"}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <Link to="/admin/products/$productId" params={{ productId: product.id }}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Խմբագրել
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    disabled={copy.isPending}
                    onClick={() => copy.mutate(product)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Կրկնօրինակել
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-destructive"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Ջնջե՞լ «${product.name}» ապրանքը։`)) {
                        remove.mutate(product);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Ջնջել
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
