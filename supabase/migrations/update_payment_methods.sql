-- Update payment methods to include credit_card and check
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_method_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_method_check
CHECK (method IN ('cash', 'credit_card', 'check', 'upi', 'bank_transfer'));

-- Add created_at column if it doesn't exist
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
