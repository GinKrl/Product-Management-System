-- 04_provision_user_trigger.sql

-- Step 1: Create or update the user table (Ensuring singular 'user' and 'user_type' exist)
-- Note: "user" is a reserved word in PostgreSQL, so we wrap it in double quotes.
CREATE TABLE IF NOT EXISTS public."user" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL DEFAULT 'USER',
  record_status TEXT NOT NULL DEFAULT 'INACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_module_id UUID;
  default_right_id UUID;
  new_user_module_id UUID;
BEGIN
  -- 2A. Insert into the main user table as 'USER' and 'INACTIVE'
  INSERT INTO public."user" (id, email, full_name, user_type, record_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'USER',
    'INACTIVE'
  );

  -- 2B. Assign default Module (e.g., finding the 'Overview' or 'Dashboard' module)
  -- FELIX: Change 'Overview' to whatever the default module name is in your DB
  SELECT id INTO default_module_id FROM public."Module" WHERE name = 'Overview' LIMIT 1;

  IF default_module_id IS NOT NULL THEN
    -- Insert into user_module junction table
    INSERT INTO public."user_module" (user_id, module_id)
    VALUES (NEW.id, default_module_id)
    RETURNING id INTO new_user_module_id;

    -- 2C. Assign default Rights (e.g., finding the 'Read' or 'View' right)
    -- FELIX: Change 'Read' to whatever the default right name is in your DB
    SELECT id INTO default_right_id FROM public."rights" WHERE name = 'Read' LIMIT 1;

    IF default_right_id IS NOT NULL THEN
      -- Insert into UserModule_Rights junction table
      INSERT INTO public."UserModule_Rights" (user_module_id, rights_id)
      VALUES (new_user_module_id, default_right_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 3: Create the Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.provision_new_user();
