/*
  # Add User Profile Trigger

  1. New Functions
    - `handle_new_user`: Function to create a profile when a new user signs up
    
  2. New Triggers
    - `on_auth_user_created`: Trigger that runs after a new user is created
    
  3. Changes
    - Automatically creates a profile entry when a new user signs up
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();