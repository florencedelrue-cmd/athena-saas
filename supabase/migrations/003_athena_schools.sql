-- Athena CLW + Athena Heule — vaste scholen, geen self-service registratie
-- Run after 001_initial_schema.sql

ALTER TABLE schools ADD COLUMN IF NOT EXISTS email_domain TEXT UNIQUE;

INSERT INTO schools (name, plan, email_domain, subscription_status)
SELECT 'Athena CLW', 'pro', 'athena-clw.be', 'active'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE email_domain = 'athena-clw.be');

INSERT INTO schools (name, plan, email_domain, subscription_status)
SELECT 'Athena Heule', 'pro', 'athena-heule.be', 'active'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE email_domain = 'athena-heule.be');
