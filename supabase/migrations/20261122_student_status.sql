-- Super 100 Mission 2027: separate Pending, Approved, and Blocked student access.
-- Run once in YOUR Supabase project's SQL Editor (with project-owner approval).
-- This migration is not automatically executed by GitHub Pages.
-- IMPORTANT: before this change, profiles.approved=false represented BOTH
-- never-approved and manually-blocked users; old blocked records CANNOT be
-- reliably identified or migrated automatically.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;

-- Approved accounts must never be blocked simultaneously.
UPDATE public.profiles SET blocked=false WHERE approved=true AND blocked=true;

-- OPTIONAL, BEFORE creating the guard trigger: if you have VERIFIED IDs of
-- accounts that were blocked under the old boolean-only design, mark them:
-- UPDATE public.profiles SET blocked=true
--   WHERE approved=false AND id IN ('verified-uuid-1', 'verified-uuid-2');
-- Do NOT run the example with placeholder IDs; review each student first.

DO $migration$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM pg_constraint
    WHERE conname='profiles_no_approved_blocked'
      AND conrelid='public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_no_approved_blocked
      CHECK (NOT (COALESCE(approved,false) AND blocked));
  END IF;
END $migration$;

-- Update security: even if an existing "profiles" update RLS policy is broad,
-- only a currently-approved admin may modify access status.
CREATE OR REPLACE FUNCTION public.guard_student_access_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,pg_temp
AS $guard$
BEGIN
  IF COALESCE(NEW.approved,false) AND COALESCE(NEW.blocked,false) THEN
    RAISE EXCEPTION 'A student cannot be approved and blocked simultaneously';
  END IF;

  IF NEW.approved IS DISTINCT FROM OLD.approved
     OR NEW.blocked IS DISTINCT FROM OLD.blocked THEN
    IF OLD.admin THEN
      RAISE EXCEPTION 'Admin account access must not be changed from student management';
    END IF;

    IF auth.uid() IS NULL OR NOT EXISTS(
      SELECT 1 FROM public.profiles p
      WHERE p.id=auth.uid()
        AND p.admin=true
        AND p.approved=true
        AND p.blocked=false
    ) THEN
      RAISE EXCEPTION 'Only an approved administrator can change student access status';
    END IF;
  END IF;
  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS guard_student_access_status_update
  ON public.profiles;

CREATE TRIGGER guard_student_access_status_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_student_access_status();

COMMIT;

-- Verification (run as a separate query after successful migration):
-- SELECT username, approved, blocked
-- FROM public.profiles
-- WHERE admin=false
-- ORDER BY blocked DESC, approved ASC, username;
