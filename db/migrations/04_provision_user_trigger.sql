-- 04_provision_user_trigger.sql

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_module_id int4;
  default_right_id int4;
BEGIN
  -- A. Insert into the main user table as 'USER' and 'INACTIVE'
  INSERT INTO public."user" (id, email, full_name, user_type, record_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'USER',
    'INACTIVE'
  );

  -- B. Find the IDs for the default module and right
  -- FELIX: Ensure 'Overview' and 'Read' match the exact text seeded by Flores
  SELECT id INTO default_module_id FROM public.module WHERE module_name = 'Overview' LIMIT 1;
  SELECT id INTO default_right_id FROM public.rights WHERE right_name = 'Read' LIMIT 1;

  -- C. Insert into the single junction table shown in the ERD
  IF default_module_id IS NOT NULL AND default_right_id IS NOT NULL THEN
    INSERT INTO public.usermodule_rights (user_id, module_id, right_id)
    VALUES (NEW.id, default_module_id, default_right_id);
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.provision_new_user();
