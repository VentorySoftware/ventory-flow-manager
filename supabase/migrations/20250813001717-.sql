-- Create import tables
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  import_type text NOT NULL CHECK (import_type IN ('products','stock','users')),
  file_name text NOT NULL,
  file_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  total_records integer NOT NULL DEFAULT 0,
  processed_records integer NOT NULL DEFAULT 0,
  successful_records integer NOT NULL DEFAULT 0,
  failed_records integer NOT NULL DEFAULT 0,
  error_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT import_jobs_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

CREATE TABLE IF NOT EXISTS public.import_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id uuid NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  record_data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','error','skipped')),
  error_message text,
  created_record_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON public.import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_records_job ON public.import_records(import_job_id);
CREATE INDEX IF NOT EXISTS idx_import_records_status ON public.import_records(status);

-- Enable RLS
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_records ENABLE ROW LEVEL SECURITY;

-- Policies for import_jobs
DO $$ BEGIN
  CREATE POLICY "Users can manage their own import jobs"
  ON public.import_jobs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all import jobs"
  ON public.import_jobs
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies for import_records
DO $$ BEGIN
  CREATE POLICY "Users can manage records of their own jobs"
  ON public.import_records
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.import_jobs j
    WHERE j.id = import_job_id AND j.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.import_jobs j
    WHERE j.id = import_job_id AND j.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all import records"
  ON public.import_records
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage bucket for imports (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'imports' bucket
DO $$ BEGIN
  CREATE POLICY "Admins can access all import files"
  ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'imports' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'imports' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read their own import files"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'imports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload their own import files"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'imports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own import files"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'imports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'imports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own import files"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'imports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;