import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/StateBlocks";
import { fetchProducts } from "@/services/products";

type ShopSearch = { q?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q.length > 0 ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Խանութ — MYANS" },
      { name: "description", content: "MYANS շապիկների հավաքածու։ Հայկական streetwear։" },
      { property: "og:title", content: "Խանութ — MYANS" },
      { property: "og:description", content: "MYANS շապիկների հավաքածու։" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { q } = Route.useSearch();
  const products = useQuery({
    queryKey: ["products", "shop", q ?? ""],
    queryFn: () => fetchProducts({ search: q, sort: "newest" }),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-2xl font-semibold md:text-3xl">Խանութ</h1>
      {q && <p className="mt-2 text-sm text-muted-foreground">Որոնում՝ «{q}»</p>}

      <div className="mt-8">
        {products.isLoading && <ProductGridSkeleton />}
        {products.isError && <ErrorState />}
        {products.data && products.data.length === 0 && (
          <EmptyState title={q ? "Ոչինչ չգտնվեց։" : "Այս պահին ապրանքներ չկան։"} />
        )}
        {products.data && products.data.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.data.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
