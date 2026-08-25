import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/StateBlocks";
import { fetchProducts } from "@/services/products";
import { fetchHeroImage } from "@/services/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MYANS — Armenian Streetwear" },
      { name: "description", content: "MYANS — հայկական ժամանակակից streetwear բրենդ։" },
      { property: "og:title", content: "MYANS — Armenian Streetwear" },
      {
        property: "og:description",
        content: "MYANS — հայկական ժամանակակից streetwear բրենդ։",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const hero = useQuery({ queryKey: ["hero-image"], queryFn: fetchHeroImage });
  const products = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => fetchProducts({ sort: "newest" }),
  });

  return (
    <main>
      <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-surface md:min-h-[86svh]">
        {hero.data?.url && (
          <img
            src={hero.data.url}
            alt="MYANS հավաքածու"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        )}
        <div className="relative w-full px-4 pb-12 md:px-8 md:pb-16">
          <div className="inline-block bg-background px-5 py-6 md:px-8 md:py-8">
            <p className="brand-wordmark text-3xl md:text-5xl">MYANS</p>
            <p className="label-caps mt-2 text-muted-foreground">Armenian Streetwear</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-12 items-center justify-center border border-primary bg-primary px-8 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
            >
              Դիտել հավաքածուն
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="label-caps">Collection 01</h2>
          <Link to="/shop" className="label-caps text-muted-foreground hover:text-foreground">
            Բոլորը
          </Link>
        </div>

        {products.isLoading && <ProductGridSkeleton />}
        {products.isError && <ErrorState />}
        {products.data && products.data.length === 0 && (
          <EmptyState title="Այս պահին ապրանքներ չկան։" />
        )}
        {products.data && products.data.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.data.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
