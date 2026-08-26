import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { formatAmd, shortId } from "@/lib/format";
import { createOrder } from "@/services/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Պատվերի ձևակերպում — MYANS" },
      { name: "description", content: "Ձևակերպեք ձեր MYANS պատվերը՝ առաքումով ողջ Հայաստանում։" },
      { property: "og:title", content: "Պատվերի ձևակերպում — MYANS" },
      {
        property: "og:description",
        content: "Ձևակերպեք ձեր MYANS պատվերը՝ առաքումով ողջ Հայաստանում։",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, shipping, total, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  async function submit() {
    if (!form.customer_name.trim() || !form.phone.trim() || !form.city.trim() || !form.address.trim()) {
      toast.error("Լրացրեք բոլոր պարտադիր դաշտերը։");
      return;
    }
    setSubmitting(true);
    try {
      const id = await createOrder({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        subtotal_amd: subtotal,
        shipping_amd: shipping,
        total_amd: total,
        lines,
      });
      clear();
      setPlaced(id);
    } catch {
      toast.error("Չհաջողվեց ուղարկել պատվերը։");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <h1 className="text-2xl font-semibold md:text-3xl">Շնորհակալություն</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ձեր պատվերը #{shortId(placed)} ընդունված է։ Մենք կկապվենք ձեզ հետ շուտով։
        </p>
        <Button asChild className="mt-8 h-12">
          <Link to="/shop">Շարունակել գնումները</Link>
        </Button>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 md:px-8">
        <EmptyState
          title="Զամբյուղը դատարկ է։"
          action={
            <Button asChild className="h-12" onClick={() => void navigate({ to: "/shop" })}>
              <Link to="/shop">Դեպի խանութ</Link>
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-2xl font-semibold md:text-3xl">Պատվերի ձևակերպում</h1>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="customer_name">Անուն Ազգանուն</Label>
          <Input
            id="customer_name"
            className="h-12"
            value={form.customer_name}
            onChange={(e) => set("customer_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Հեռախոս</Label>
          <Input
            id="phone"
            className="h-12"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Քաղաք</Label>
          <Input
            id="city"
            className="h-12"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Հասցե</Label>
          <Input
            id="address"
            className="h-12"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Նշում (ըստ ցանկության)</Label>
          <Textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Ենթագումար</span>
            <span>{formatAmd(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Առաքում</span>
            <span>{shipping === 0 ? "Անվճար" : formatAmd(shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-medium">
            <span>Ընդամենը</span>
            <span>{formatAmd(total)}</span>
          </div>
        </div>

        <Button type="submit" className="h-12 w-full" disabled={submitting}>
          {submitting ? "Ուղարկվում է…" : "Հաստատել պատվերը"}
        </Button>
      </form>
    </main>
  );
}
