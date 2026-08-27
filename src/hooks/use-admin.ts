import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves whether the signed-in user is an administrator.
 * Admin rights come from the user_roles table; the first admin account is
 * created once through the secure setup on /admin/login.
 */
export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return Boolean(roles);
    },
  });
}
