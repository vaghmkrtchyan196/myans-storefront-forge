import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** True when at least one admin account already exists. */
export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw error;
  return { exists: (count ?? 0) > 0 };
});

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * One-time bootstrap: creates the very first admin account.
 * Refuses to run once any admin exists, so it cannot be used to escalate later.
 */
export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => setupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw countError;
    if ((count ?? 0) > 0) {
      return { ok: false as const, message: "Ադմին հաշիվն արդեն ստեղծված է։" };
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) {
      return { ok: false as const, message: "Չհաջողվեց ստեղծել հաշիվը։" };
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { ok: false as const, message: "Չհաջողվեց տալ ադմին իրավունքները։" };
    }

    return { ok: true as const, message: "Ադմին հաշիվը ստեղծվեց։" };
  });
