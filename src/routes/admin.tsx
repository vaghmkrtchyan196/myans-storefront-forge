import { Link, Outlet, createFileRoute, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith("/admin/login")) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      const { data: claimed } = await supabase.rpc("claim_admin");
      if (claimed !== true) throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Վահանակ", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Ապրանքներ", icon: Package },
  { to: "/admin/orders", label: "Պատվերներ", icon: ShoppingBag },
  { to: "/admin/settings", label: "Կարգավորումներ", icon: Settings },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin/login")) return <Outlet />;

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`) || pathname === to;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const links = (onClick?: () => void) => (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
            isActive(item.to, "exact" in item ? item.exact : false)
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
      <button
        onClick={() => {
          onClick?.();
          void signOut();
        }}
        className="mt-2 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        <LogOut className="h-4 w-4" />
        Ելք
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <span className="text-sm font-bold tracking-[0.2em]">MYANS ADMIN</span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Մենյու">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-4">
            <SheetTitle className="mb-4 text-sm font-bold tracking-[0.2em]">MYANS ADMIN</SheetTitle>
            {links(() => setOpen(false))}
          </SheetContent>
        </Sheet>
      </header>

      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border p-4 md:block">
          <div className="mb-6 px-3 text-sm font-bold tracking-[0.2em]">MYANS ADMIN</div>
          {links()}
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
