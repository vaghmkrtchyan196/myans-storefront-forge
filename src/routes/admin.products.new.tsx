import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ProductForm, toFormValues } from "@/components/admin/ProductForm";
import type { ProductFormValues } from "@/components/admin/ProductForm";
import { createProduct } from "@/services/admin";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProduct,
});

function NewProduct() {
  const [values, setValues] = useState<ProductFormValues>(toFormValues(null));
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function submit() {
    if (!values.name.trim()) {
      toast.error("Անվանումը պարտադիր է։");
      return;
    }
    setSaving(true);
    try {
      const { sizes, ...input } = values;
      const id = await createProduct({ ...input, name: input.name.trim() }, sizes);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Ապրանքը ստեղծվեց։ Այժմ ավելացրեք նկարներ։");
      void navigate({ to: "/admin/products/$productId", params: { productId: id } });
    } catch {
      toast.error("Չհաջողվեց ստեղծել ապրանքը։");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold md:text-2xl">Նոր ապրանք</h1>
      <ProductForm
        values={values}
        onChange={setValues}
        onSubmit={submit}
        submitting={saving}
        submitLabel="Ստեղծել"
      />
      <p className="text-xs text-muted-foreground">
        Նկարները կարող եք ավելացնել ապրանքը ստեղծելուց հետո։
      </p>
    </div>
  );
}
