-- Test Data Seed Script for Anjum's Diet App
-- Run this in Supabase SQL Editor

-- Insert test clients
INSERT INTO clients (name, email, phone, package, duration_months, status, start_date, end_date, next_appointment_date, password_hash)
VALUES
  ('Raj Kumar', 'raj.kumar@test.com', '9876543210', 'Gold', 3, 'active', '2025-02-01', '2025-05-01', '2025-02-20', '$2a$10$..placeholder..'),
  ('Priya Patel', 'priya.patel@test.com', '9765432109', 'Platinum', 6, 'active', '2025-01-15', '2025-07-15', '2025-02-18', '$2a$10$..placeholder..'),
  ('Arjun Singh', 'arjun.singh@test.com', '9654321098', 'Silver', 2, 'active', '2025-02-10', '2025-04-10', '2025-02-25', '$2a$10$..placeholder..'),
  ('Neha Sharma', 'neha.sharma@test.com', '9543210987', 'Gold', 4, 'paused', '2024-12-01', '2025-04-01', NULL, '$2a$10$..placeholder..'),
  ('Vikram Desai', 'vikram.desai@test.com', '9432109876', 'Platinum', 12, 'completed', '2024-02-01', '2025-02-01', NULL, '$2a$10$..placeholder..'),
  ('Simran Kaur', 'simran.kaur@test.com', '9321098765', 'Silver', 3, 'active', '2025-01-20', '2025-04-20', '2025-02-22', '$2a$10$..placeholder..'),
  ('Aditya Nair', 'aditya.nair@test.com', '9210987654', 'Gold', 5, 'inactive', '2024-11-01', '2025-04-01', NULL, '$2a$10$..placeholder..')
ON CONFLICT (email) DO NOTHING;

-- Get the IDs of inserted clients
-- Note: You'll need to run the client inserts first, then use their actual IDs for profiles and logs

-- For now, let's show you how to manually add this data
-- OR we can use the Supabase dashboard directly