import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/StateBlocks";
import { fetchProducts } from "@/services/products";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Նորույթներ — MYANS" },
      { name: "description", content: "MYANS-ի վերջին թողարկումները։" },
      { property: "og:title", content: "Նորույթներ — MYANS" },
      { property: "og:description", content: "MYANS-ի վերջին թողարկումները։" },
    ],
  }),
  component: NewPage,
});

function NewPage() {
  const products = useQuery({
    queryKey: ["products", "new"],
    queryFn: () => fetchProducts({ sort: "newest" }),
  });
  const latest = products.data?.slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-2xl font-semibold md:text-3xl">Նորույթներ</h1>

      <div className="mt-8">
        {products.isLoading && <ProductGridSkeleton count={4} />}
        {products.isError && <ErrorState />}
        {latest && latest.length === 0 && <EmptyState title="Այս պահին ապրանքներ չկան։" />}
        {latest && latest.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {latest.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
