import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadHeroImage } from "@/services/admin";
import { fetchHeroImage, fetchSetting, saveSetting, HERO_IMAGE_KEY } from "@/services/settings";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const TEXT_KEYS = [
  { key: "store_name", label: "Խանութի անվանում" },
  { key: "contact_phone", label: "Հեռախոս" },
  { key: "instagram_url", label: "Instagram հղում" },
] as const;

function AdminSettings() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const settings = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const entries = await Promise.all(
        [...TEXT_KEYS.map((item) => item.key), "store_description"].map(
          async (key) => [key, (await fetchSetting(key)) ?? ""] as const,
        ),
      );
      return Object.fromEntries(entries) as Record<string, string>;
    },
  });

  const hero = useQuery({ queryKey: ["hero-image"], queryFn: fetchHeroImage });

  useEffect(() => {
    if (settings.data) setForm((prev) => (Object.keys(prev).length ? prev : settings.data));
  }, [settings.data]);

  async function save() {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(form)) {
        await saveSetting(key, value.trim() || null);
      }
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Կարգավորումները պահպանվեցին։");
    } catch {
      toast.error("Չհաջողվեց պահպանել կարգավորումները։");
    } finally {
      setSaving(false);
    }
  }

  async function onHero(file: File | null) {
    if (!file) return;
    setSaving(true);
    try {
      const path = await uploadHeroImage(file);
      await saveSetting(HERO_IMAGE_KEY, path);
      await queryClient.invalidateQueries({ queryKey: ["hero-image"] });
      await hero.refetch();
      toast.success("Գլխավոր նկարը թարմացվեց։");
    } catch {
      toast.error("Չհաջողվեց վերբեռնել նկարը։");
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (settings.isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold md:text-2xl">Կարգավորումներ</h1>

      <div className="space-y-4">
        {TEXT_KEYS.map((item) => (
          <div key={item.key} className="space-y-2">
            <Label htmlFor={item.key}>{item.label}</Label>
            <Input
              id={item.key}
              className="h-12"
              value={form[item.key] ?? ""}
              onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="store_description">Խանութի նկարագրություն</Label>
          <Textarea
            id="store_description"
            rows={4}
            value={form["store_description"] ?? ""}
            onChange={(e) => setForm({ ...form, store_description: e.target.value })}
          />
        </div>
        <Button className="h-12" disabled={saving} onClick={() => void save()}>
          {saving ? "Պահպանվում է…" : "Պահպանել"}
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest">Գլխավոր նկար</h2>
        {hero.data?.url && (
          <img src={hero.data.url} alt="Գլխավոր նկար" className="aspect-[16/9] w-full object-cover" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onHero(e.target.files?.[0] ?? null)}
        />
        <Button
          variant="outline"
          className="h-12"
          disabled={saving}
          onClick={() => fileRef.current?.click()}
        >
          Փոխել գլխավոր նկարը
        </Button>
      </section>
    </div>
  );
}
