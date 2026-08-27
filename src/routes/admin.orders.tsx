import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, Spinner } from "@/components/StateBlocks";
import { formatAmd, formatDate, shortId } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";
import { fetchOrders, updateOrderStatus } from "@/services/orders";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "MYANS Ադմին — Պատվերներ" },
      { name: "description", content: "MYANS խանութի պատվերների կառավարում։" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "MYANS Ադմին — Պատվերներ" },
      { property: "og:description", content: "MYANS խանութի պատվերների կառավարում։" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const orders = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const change = useMutation({
    mutationFn: ({ id, value }: { id: string; value: OrderStatus }) => updateOrderStatus(id, value),
    onSuccess: () => {
      toast.success("Կարգավիճակը թարմացվեց։");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Չհաջողվեց թարմացնել կարգավիճակը։"),
  });

  const rows = (orders.data ?? []).filter((order) => status === "all" || order.status === status);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold md:text-2xl">Պատվերներ</h1>

      <select
        className="h-12 w-full max-w-xs border border-input bg-background px-3 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
      >
        <option value="all">Բոլոր կարգավիճակները</option>
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {ORDER_STATUS_LABELS[value]}
          </option>
        ))}
      </select>

      {orders.isLoading ? (
        <Spinner />
      ) : orders.isError ? (
        <ErrorState />
      ) : rows.length === 0 ? (
        <EmptyState title="Պատվերներ չկան։" />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((order) => (
            <li key={order.id} className="py-4">
              <button
                className="flex w-full items-start justify-between gap-4 text-left"
                onClick={() => setOpenId(openId === order.id ? null : order.id)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    #{shortId(order.id)} · {order.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  <p className="text-xs text-muted-foreground">{order.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatAmd(order.total_amd)}</p>
                  <p className="text-xs text-muted-foreground">
                    {ORDER_STATUS_LABELS[order.status]}
                  </p>
                </div>
              </button>

              {openId === order.id && (
                <div className="mt-4 space-y-4 border border-border p-4">
                  <div className="text-sm">
                    <p>
                      {order.city}, {order.address}
                    </p>
                    {order.notes && (
                      <p className="mt-1 text-muted-foreground">Նշում՝ {order.notes}</p>
                    )}
                  </div>

                  <ul className="space-y-2 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {item.product_name}
                          {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                        </span>
                        <span>{formatAmd(item.unit_price_amd * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-1 border-t border-border pt-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ենթագումար</span>
                      <span>{formatAmd(order.subtotal_amd)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Առաքում</span>
                      <span>{formatAmd(order.shipping_amd)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Ընդամենը</span>
                      <span>{formatAmd(order.total_amd)}</span>
                    </div>
                  </div>

                  <select
                    className="h-12 w-full border border-input bg-background px-3 text-sm"
                    value={order.status}
                    onChange={(e) =>
                      change.mutate({ id: order.id, value: e.target.value as OrderStatus })
                    }
                  >
                    {ORDER_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {ORDER_STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
