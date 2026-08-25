import { Link } from "@tanstack/react-router";

import { formatAmd } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const image = product.images[0];

  return (
    <Link
      to="/product/$productId"
      params={{ productId: product.id }}
      className="group block"
      aria-label={product.name}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        {image?.displayUrl ? (
          <img
            src={image.displayUrl}
            alt={`${product.name} — ${product.color}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            MYANS
          </div>
        )}
        {!product.is_available && (
          <span className="label-caps absolute left-0 top-0 bg-background px-2 py-1 text-out-of-stock">
            Առկա չէ
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.color}</p>
        <p className="text-sm">{formatAmd(product.price_amd)}</p>
      </div>
    </Link>
  );
}
