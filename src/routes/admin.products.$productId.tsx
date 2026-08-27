import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm, toFormValues } from "@/components/admin/ProductForm";
import type { ProductFormValues } from "@/components/admin/ProductForm";
import { EmptyState, ErrorState, Spinner } from "@/components/StateBlocks";
import { Button } from "@/components/ui/button";
import { deleteProduct, updateProduct } from "@/services/admin";
import { fetchProduct } from "@/services/products";

export const Route = createFileRoute("/admin/products/$productId")({
  head: () => ({
    meta: [
      { title: "MYANS Ադմին — Ապրանքի խմբագրում" },
      { name: "description", content: "Խմբագրել MYANS ապրանքը։" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "MYANS Ադմին — Ապրանքի խմբագրում" },
      { property: "og:description", content: "Խմբագրել MYANS ապրանքը։" },
    ],
  }),
  component: EditProduct,
});

function EditProduct() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProductFormValues | null>(null);
  const [saving, setSaving] = useState(false);

  const product = useQuery({
    queryKey: ["products", productId],
    queryFn: () => fetchProduct(productId),
  });

  useEffect(() => {
    if (product.data && !values) setValues(toFormValues(product.data));
  }, [product.data, values]);

  if (product.isLoading) return <Spinner />;
  if (product.isError) return <ErrorState />;
  if (!product.data) return <EmptyState title="Ապրանքը չի գտնվել։" />;

  const current = values ?? toFormValues(product.data);

  async function submit() {
    if (!current.name.trim()) {
      toast.error("Անվանումը պարտադիր է։");
      return;
    }
    setSaving(true);
    try {
      const { sizes, ...input } = current;
      await updateProduct(productId, { ...input, name: input.name.trim() }, sizes);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Փոփոխությունները պահպանվեցին։");
    } catch {
      toast.error("Չհաջողվեց պահպանել։");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct() {
    if (!product.data) return;
    if (!window.confirm(`Ջնջե՞լ «${product.data.name}» ապրանքը։`)) return;
    try {
      await deleteProduct(product.data);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Ապրանքը ջնջվեց։");
      void navigate({ to: "/admin/products" });
    } catch {
      toast.error("Չհաջողվեց ջնջել ապրանքը։");
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold md:text-2xl">Խմբագրել ապրանքը</h1>

      <ProductForm
        values={current}
        onChange={setValues}
        onSubmit={submit}
        submitting={saving}
        submitLabel="Պահպանել"
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest">Նկարներ</h2>
        <ImageManager
          productId={productId}
          images={product.data.images}
          onChanged={() => void product.refetch()}
        />
      </section>

      <Button variant="outline" className="h-12 text-destructive" onClick={() => void removeProduct()}>
        Ջնջել ապրանքը
      </Button>
    </div>
  );
}
