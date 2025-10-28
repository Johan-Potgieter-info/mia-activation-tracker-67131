-- Create deployments table for storing deployment form data
CREATE TABLE public.deployments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id text UNIQUE,
  event_name text NOT NULL,
  address text NOT NULL,
  contact text NOT NULL,
  lead text NOT NULL,
  support text NOT NULL,
  officer text NOT NULL,
  start_time text NOT NULL,
  end_time text,
  people_engaged integer DEFAULT 0,
  bookings integer DEFAULT 0,
  custom_metric_1_name text,
  custom_metric_1_value integer DEFAULT 0,
  custom_metric_2_name text,
  custom_metric_2_value integer DEFAULT 0,
  custom_metric_3_name text,
  custom_metric_3_value integer DEFAULT 0,
  custom_metric_4_name text,
  custom_metric_4_value integer DEFAULT 0,
  selected_equipment jsonb DEFAULT '[]'::jsonb,
  notes text,
  success text,
  improve text,
  actions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert deployments (public form)
CREATE POLICY "Anyone can insert deployments"
ON public.deployments
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to view deployments
CREATE POLICY "Anyone can view deployments"
ON public.deployments
FOR SELECT
TO public
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_deployments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deployments_timestamp
BEFORE UPDATE ON public.deployments
FOR EACH ROW
EXECUTE FUNCTION public.update_deployments_updated_at();

-- Create index for faster lookups by submission_id
CREATE INDEX idx_deployments_submission_id ON public.deployments(submission_id);

-- Create index for date-based queries
CREATE INDEX idx_deployments_created_at ON public.deployments(created_at DESC);