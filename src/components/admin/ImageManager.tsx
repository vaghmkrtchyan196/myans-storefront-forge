import { useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/lib/types";
import {
  deleteProductImage,
  reorderImages,
  replaceProductImage,
  setMainImage,
  uploadProductImage,
} from "@/services/admin";

/** Manages the image gallery of an existing product against Supabase Storage. */
export function ImageManager({
  productId,
  images,
  onChanged,
}: {
  productId: string;
  images: ProductImage[];
  onChanged: () => void;
}) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState<ProductImage | null>(null);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function run(action: () => Promise<void>, success: string, failure: string) {
    setBusy(true);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      onChanged();
      toast.success(success);
    } catch {
      toast.error(failure);
    } finally {
      setBusy(false);
    }
  }

  async function onAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    await run(
      async () => {
        for (const file of Array.from(files)) {
          await uploadProductImage(productId, file);
        }
      },
      "Նկարը վերբեռնվեց։",
      "Չհաջողվեց վերբեռնել նկարը։",
    );
    if (addRef.current) addRef.current.value = "";
  }

  async function onReplace(file: File | null) {
    const target = replacing;
    if (!file || !target) return;
    await run(
      () => replaceProductImage(target.id, productId, target.storage_path, file),
      "Նկարը փոխվեց։",
      "Չհաջողվեց փոխել նկարը։",
    );
    setReplacing(null);
    if (replaceRef.current) replaceRef.current.value = "";
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    void run(
      () => reorderImages(next.map((image, position) => ({ id: image.id, position }))),
      "Փոփոխությունները պահպանվեցին։",
      "Չհաջողվեց փոխել հերթականությունը։",
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Նկարներ</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => addRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />+ Ավելացնել նկար
        </Button>
      </div>

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void onAdd(e.target.files)}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onReplace(e.target.files?.[0] ?? null)}
      />

      {images.length === 0 ? (
        <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Դեռ նկարներ չկան։
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={image.id} className="border border-border">
              <div className="relative aspect-[4/5] bg-muted">
                {image.displayUrl ? (
                  <img
                    src={image.displayUrl}
                    alt="Ապրանքի նկար"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                {image.is_main && (
                  <span className="absolute left-1 top-1 bg-foreground px-2 py-0.5 text-[10px] text-background">
                    Հիմնական
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy || image.is_main}
                  onClick={() =>
                    void run(
                      () => setMainImage(productId, image.id),
                      "Փոփոխությունները պահպանվեցին։",
                      "Չհաջողվեց փոխել հիմնական նկարը։",
                    )
                  }
                  title="Դարձնել հիմնական"
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setReplacing(image);
                    replaceRef.current?.click();
                  }}
                >
                  Փոխել
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy || index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => deleteProductImage(image.id, image.storage_path),
                      "Նկարը ջնջվեց։",
                      "Չհաջողվեց ջնջել նկարը։",
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
