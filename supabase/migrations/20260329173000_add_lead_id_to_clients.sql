-- Add lead_id to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_id BIGINT REFERENCES leads(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_lead_id ON clients(lead_id);

-- Optional: Link existing clients to leads by matching email (best-effort)
UPDATE clients c
SET lead_id = l.id
FROM leads l
WHERE LOWER(c.email) = LOWER(l.email)
AND c.lead_id IS NULL;

-- Ensure leads are marked as converted if they are now linked
UPDATE leads l
SET status = 'converted'
FROM clients c
WHERE c.lead_id = l.id
AND l.status != 'converted';
