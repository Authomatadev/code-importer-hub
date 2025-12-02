-- Fix search_path for calculate_time_seconds function
CREATE OR REPLACE FUNCTION public.calculate_time_seconds()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.time_net ~ '^\d+:\d{2}:\d{2}$' THEN
    NEW.time_net_seconds := (
      (split_part(NEW.time_net, ':', 1)::int * 3600) +
      (split_part(NEW.time_net, ':', 2)::int * 60) +
      split_part(NEW.time_net, ':', 3)::int
    );
  ELSE
    NEW.time_net_seconds := NULL;
  END IF;
  RETURN NEW;
END;
$$;