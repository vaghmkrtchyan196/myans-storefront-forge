import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, Spinner } from "@/components/StateBlocks";
import { useCart } from "@/hooks/use-cart";
import { formatAmd } from "@/lib/format";
import { SIZE_OPTIONS } from "@/lib/types";
import { fetchProduct } from "@/services/products";

export const Route = createFileRoute("/product/$productId")({
  head: () => ({
    meta: [
      { title: "Ապրանք — MYANS" },
      { name: "description", content: "MYANS շապիկ։ Հայկական ժամանակակից streetwear։" },
      { property: "og:title", content: "Ապրանք — MYANS" },
      { property: "og:description", content: "MYANS շապիկ։ Հայկական streetwear։" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const { addLine } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  });

  if (query.isLoading) return <Spinner />;
  if (query.isError) return <ErrorState />;

  const product = query.data;
  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Այս ապրանքը չի գտնվել։"
          action={
            <Link to="/shop" className="label-caps underline">
              Դեպի խանութ
            </Link>
          }
        />
      </main>
    );
  }

  const images = product.images;
  const main = images[activeImage] ?? images[0];
  const availableSizes = new Set(
    product.sizes.filter((entry) => entry.is_available).map((entry) => entry.size),
  );
  const shownSizes = product.sizes.length
    ? product.sizes.map((entry) => entry.size)
    : [...SIZE_OPTIONS];

  function handleAdd() {
    if (!product) return;
    if (!size) {
      toast.error("Խնդրում ենք ընտրել չափսը։");
      return;
    }
    addLine({
      productId: product.id,
      name: product.name,
      size,
      price_amd: product.price_amd,
      quantity: 1,
      imagePath: main?.storage_path ?? null,
      imageUrl: main?.displayUrl ?? null,
    });
    toast.success("Ավելացվեց զամբյուղ։");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:grid md:grid-cols-2 md:gap-12 md:px-8 md:py-14">
      <div>
        <div className="aspect-[4/5] w-full overflow-hidden bg-surface">
          {main?.displayUrl ? (
            <img
              src={main.displayUrl}
              alt={`${product.name} — ${product.color}`}
              className="h-full w-full object-cover"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              MYANS
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Նկար ${index + 1}`}
                className={`h-20 w-16 shrink-0 overflow-hidden border ${
                  index === activeImage ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={image.displayUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 md:mt-0">
        <h1 className="text-xl font-semibold md:text-2xl">{product.name}</h1>
        <p className="mt-2 text-lg">{formatAmd(product.price_amd)}</p>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Գույն՝</dt>
            <dd>{product.color || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Առկայություն՝</dt>
            <dd className={product.is_available ? "text-in-stock" : "text-out-of-stock"}>
              {product.is_available ? "Առկա է" : "Առկա չէ"}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <p className="label-caps mb-3">Չափս</p>
          <div className="flex flex-wrap gap-2">
            {shownSizes.map((option) => {
              const enabled = availableSizes.has(option) && product.is_available;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setSize(option)}
                  className={`h-12 min-w-14 border px-4 text-sm transition-colors ${
                    size === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  } ${enabled ? "" : "cursor-not-allowed text-muted-foreground line-through opacity-50"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.is_available}
          className="mt-8 h-13 w-full border border-primary bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.is_available ? "Ավելացնել զամբյուղ" : "Առկա չէ"}
        </button>

        {product.description && (
          <div className="mt-10 border-t border-border pt-6">
            <p className="label-caps mb-3">Նկարագրություն</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
