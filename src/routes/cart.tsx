import { Link, createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/StateBlocks";
import { useCart } from "@/hooks/use-cart";
import { formatAmd } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Զամբյուղ — MYANS" },
      { name: "description", content: "Ձեր զամբյուղը MYANS խանութում։" },
      { property: "og:title", content: "Զամբյուղ — MYANS" },
      { property: "og:description", content: "Ձեր զամբյուղը MYANS խանութում։" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, shipping, total, setQuantity, removeLine } = useCart();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-2xl font-semibold md:text-3xl">Զամբյուղ</h1>

      {lines.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Ձեր զամբյուղը դեռ դատարկ է։"
            action={
              <Link
                to="/shop"
                className="inline-flex h-12 items-center border border-primary px-8 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Դեպի խանութ
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.size}`} className="flex gap-4 py-5">
                <Link
                  to="/product/$productId"
                  params={{ productId: line.productId }}
                  className="h-24 w-20 shrink-0 overflow-hidden bg-surface"
                >
                  {line.imageUrl && (
                    <img
                      src={line.imageUrl}
                      alt={line.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{line.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Չափս՝ {line.size}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Հեռացնել"
                      onClick={() => removeLine(line.productId, line.size)}
                      className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-input">
                      <button
                        type="button"
                        aria-label="Պակասեցնել"
                        className="flex h-11 w-11 items-center justify-center"
                        onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Ավելացնել"
                        className="flex h-11 w-11 items-center justify-center"
                        onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm">{formatAmd(line.price_amd * line.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ապրանքների ընդհանուր արժեքը</span>
              <span>{formatAmd(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Առաքում</span>
              <span>{shipping === 0 ? "Անվճար" : formatAmd(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <span>Ընդհանուր</span>
              <span>{formatAmd(total)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-8 flex h-13 w-full items-center justify-center border border-primary bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
          >
            Պատվիրել
          </Link>
        </>
      )}
    </main>
  );
}
