import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves whether the signed-in user is an administrator.
 * The first signed-in account may claim admin rights; afterwards the
 * database refuses to grant them to anyone else.
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
      if (roles) return true;

      const { data: claimed } = await supabase.rpc("claim_admin");
      return claimed === true;
    },
  });
}
