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

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
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
