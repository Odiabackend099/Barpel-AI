-- Migration: Add transfer columns to integration_settings table
-- Purpose: The transferCall Vapi tool reads transfer_phone_number, transfer_sip_uri,
--          and transfer_departments from this table. These columns were missing,
--          causing all call transfers to silently fail.
-- Context: Table already existed with (org_id, provider) UNIQUE constraint.
--          Using provider = 'transfer' for the transfer settings row.
-- Created: 2026-03-05

ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_phone_number TEXT;
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_sip_uri TEXT;
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_departments JSONB DEFAULT '{}';
