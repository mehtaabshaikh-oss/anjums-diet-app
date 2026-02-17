-- Add 'cancelled' as a valid status for clients
ALTER TABLE public.clients
DROP CONSTRAINT IF EXISTS clients_status_check;

ALTER TABLE public.clients
ADD CONSTRAINT clients_status_check
CHECK (status IN ('active', 'expired', 'paused', 'cancelled'));
