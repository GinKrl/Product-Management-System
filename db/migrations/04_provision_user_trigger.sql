-- ============================================================
-- Migration: 04_provision_user_trigger.sql
-- PR: PR-04: db/trigger-provision-user
-- Description: Automatically inserts a new row into the public
--              users table whenever a new user signs up via
--              Supabase Auth. New users default to INACTIVE.
-- Run this directly in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Create the users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  record_status TEXT NOT NULL DEFAULT 'INACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, record_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'INACTIVE'
  );
  RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.provision_new_user();
```

**Step 5:** Mag-scroll pababa → Commit message:
```
fix: replace HopeDB content with correct PR-04 trigger SQL
