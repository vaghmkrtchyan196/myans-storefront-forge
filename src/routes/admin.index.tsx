import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ErrorState, Spinner } from "@/components/StateBlocks";
import { Button } from "@/components/ui/button";
import { formatAmd } from "@/lib/format";
import { fetchDashboardStats } from "@/services/admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "MYANS Ադմին — Վահանակ" },
      { name: "description", content: "MYANS խանութի ընդհանուր վիճակագրություն։" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "MYANS Ադմին — Վահանակ" },
      { property: "og:description", content: "MYANS խանութի ընդհանուր վիճակագրություն։" },
    ],
  }),
  component: AdminDashboard,
});

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchDashboardStats,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Վահանակ</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">Ապրանքներ</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/products/new">+ Ավելացնել ապրանք</Link>
          </Button>
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Չհաջողվեց բեռնել վիճակագրությունը։" />}

      {data && (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Card label="Ընդհանուր ապրանքներ" value={String(data.productCount)} />
          <Card label="Առկա ապրանքներ" value={String(data.availableCount)} />
          <Card label="Չառկա ապրանքներ" value={String(data.unavailableCount)} />
          <Card label="Նոր պատվերներ" value={String(data.newOrders)} />
          <Card label="Բոլոր պատվերներ" value={String(data.totalOrders)} />
          <Card label="Ընդհանուր վաճառք" value={formatAmd(data.totalSales)} />
        </div>
      )}
    </div>
  );
}
