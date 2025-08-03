-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('verification', 'recovery', 'post-disbursement')),
  report_date DATE NOT NULL,
  description TEXT,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  account_number TEXT,
  account_name TEXT,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_items table
CREATE TABLE public.report_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  transportation TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reports
CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
ON public.reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for report_items
CREATE POLICY "Users can view their own report items" 
ON public.report_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.reports 
  WHERE reports.id = report_items.report_id 
  AND reports.user_id = auth.uid()
));

CREATE POLICY "Users can create their own report items" 
ON public.report_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.reports 
  WHERE reports.id = report_items.report_id 
  AND reports.user_id = auth.uid()
));

CREATE POLICY "Users can update their own report items" 
ON public.report_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.reports 
  WHERE reports.id = report_items.report_id 
  AND reports.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own report items" 
ON public.report_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.reports 
  WHERE reports.id = report_items.report_id 
  AND reports.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_report_items_report_id ON public.report_items(report_id);