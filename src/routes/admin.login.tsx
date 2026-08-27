import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MYANS Ադմին — Մուտք" },
      { name: "description", content: "MYANS խանութի կառավարման վահանակի մուտք։" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "MYANS Ադմին — Մուտք" },
      { property: "og:description", content: "MYANS խանութի կառավարման վահանակի մուտք։" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
    void adminExists().then((result) => setNeedsSetup(!result.exists));
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Լրացրեք էլ․ փոստը և գաղտնաբառը։");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Մուտքը չհաջողվեց։ Ստուգեք տվյալները։");
      return;
    }
    toast.success("Բարի գալուստ։");
    navigate({ to: "/admin", replace: true });
  }

  async function onCreateAdmin() {
    if (!email.trim() || password.length < 8) {
      toast.error("Էլ․ փոստը և առնվազն 8 նիշանոց գաղտնաբառը պարտադիր են։");
      return;
    }
    setLoading(true);
    try {
      const result = await createFirstAdmin({ data: { email: email.trim(), password } });
      if (!result.ok) {
        toast.error(result.message);
        setNeedsSetup(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.success("Հաշիվը ստեղծվեց։ Մուտք գործեք։");
        setNeedsSetup(false);
        return;
      }
      toast.success("Ադմին հաշիվը ստեղծվեց։");
      navigate({ to: "/admin", replace: true });
    } catch {
      toast.error("Չհաջողվեց ստեղծել ադմին հաշիվը։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-sm font-bold tracking-[0.3em]">MYANS ADMIN</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Մուտք գործեք կառավարման վահանակ։
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Էլ․ փոստ</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Գաղտնաբառ</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
          </div>
          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading ? "Մուտք…" : "Մուտք գործել"}
          </Button>
        </form>
      </div>
    </div>
  );
}
