REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
DROP FUNCTION IF EXISTS public.claim_admin();