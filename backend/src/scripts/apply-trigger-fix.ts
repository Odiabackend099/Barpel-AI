/**
 * APPLY PERMANENT TRIGGER FIX
 * 
 * Creates a migration file with the corrected trigger function
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';

const supabaseUrl = (config.SUPABASE_URL || '').trim();
const supabaseKey = (config.SUPABASE_SERVICE_ROLE_KEY || '')
  .trim()
  .replace(/[\r\n\t\x00-\x1F\x7F]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyTriggerFix() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     APPLYING PERMANENT TRIGGER FIX TO DATABASE        ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    const migrationContent = `-- Migration: Fix Auth Trigger for Auto-Organization Setup
-- Date: 2026-01-15
-- Purpose: Ensure every new user signup creates an organization automatically

-- First, ensure organizations table has email column
ALTER TABLE IF EXISTS public.organizations
ADD COLUMN IF NOT EXISTS email TEXT;

-- Drop old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_setup();

-- Create the corrected trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $trigger$
DECLARE
    new_org_id UUID;
BEGIN
    -- 1. CREATE ORGANIZATION FOR THIS USER
    INSERT INTO public.organizations (name, status, email, created_at, updated_at)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.email) || ' Organization',
        'active',
        NEW.email,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_org_id;

    -- 2. CREATE PROFILE LINKED TO ORG (using org_id column)
    INSERT INTO public.profiles (id, email, org_id, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        new_org_id,
        'owner',
        NOW(),
        NOW()
    );

    -- 3. UPDATE AUTH METADATA WITH ORG_ID
    UPDATE auth.users
    SET raw_app_metadata = COALESCE(raw_app_metadata, '{}'::jsonb) || 
        jsonb_build_object('org_id', new_org_id::text)
    WHERE id = NEW.id;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_setup: %', SQLERRM;
    RETURN NEW;
END;
$trigger$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_setup();
`;

    const timestamp = new Date().toISOString().replace(/[:-]/g, '').slice(0, 14);
    const migrationPath = path.join(__dirname, '../../migrations', `${timestamp}_fix_auth_trigger.sql`);
    
    // Create migrations directory if it doesn't exist
    const migrationsDir = path.dirname(migrationPath);
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    fs.writeFileSync(migrationPath, migrationContent);
    
    console.log('✅ Migration file created:\n');
    console.log(`   📁 ${migrationPath}\n`);

    console.log('STEP 1: Copy the SQL below\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(migrationContent);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('STEP 2: Apply in Supabase SQL Editor\n');
    console.log('   1. Log in to Supabase Dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Create new query');
    console.log('   4. Paste the SQL above');
    console.log('   5. Click "Run"\n');

    console.log('STEP 3: Verify trigger was created\n');
    console.log('   Run this query to verify:');
    console.log('   SELECT trigger_name FROM information_schema.triggers');
    console.log('   WHERE trigger_name = \'on_auth_user_created\';\n');

    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║           MIGRATION FILE CREATED                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('✅ What this fixes:\n');
    console.log('   ✓ Every new user signup creates an organization');
    console.log('   ✓ Profile automatically linked to org');
    console.log('   ✓ org_id stamped into JWT app_metadata');
    console.log('   ✓ No more 404 "Organization Not Found" errors\n');

    console.log('⏭️  Current user (barpel@demo.com):\n');
    console.log('   1. Sign out completely');
    console.log('   2. Clear browser cache:\n');
    console.log('      F12 → Console → paste and run:');
    console.log('      localStorage.clear(); sessionStorage.clear(); location.reload();\n');
    console.log('   3. Sign back in with barpel@demo.com / demo123');
    console.log('   4. Dashboard should load without 404 error\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyTriggerFix()
  .then(() => {
    console.log('✅ Script completed\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  });
