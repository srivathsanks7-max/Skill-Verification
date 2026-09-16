ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS analysis_data JSONB;
