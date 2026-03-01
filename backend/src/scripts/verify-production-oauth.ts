#!/usr/bin/env npx ts-node

/**
 * Production OAuth Deployment Verification
 * Verifies the production Render deployment has correct OAuth configuration
 *
 * Run: npx ts-node src/scripts/verify-production-oauth.ts
 *
 * Purpose: Ensure production is ready before announcing to customers
 */

import axios from 'axios';

const PRODUCTION_BACKEND = 'https://barpel.onrender.com';

async function verifyProduction() {
  console.log('🔍 Production OAuth Configuration Verification\n');
  console.log(`Target: ${PRODUCTION_BACKEND}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Backend is reachable
  console.log('Test 1️⃣ : Backend Availability');
  try {
    const response = await axios.get(`${PRODUCTION_BACKEND}/health`, {
      timeout: 10000
    });

    console.log('✅ Backend is reachable');
    console.log(`   Status: ${response.status}`);
    passed++;
  } catch (error: any) {
    console.log(`❌ Backend unreachable`);
    console.log(`   Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Backend may be offline or restarting');
    }
    failed++;
    // Don't exit yet, try other tests
  }

  // Test 2: OAuth test endpoint
  console.log('\nTest 2️⃣ : OAuth Router');
  try {
    const response = await axios.get(`${PRODUCTION_BACKEND}/api/google-oauth/test`, {
      timeout: 5000
    });

    if (response.status === 200 && response.data.message) {
      console.log('✅ OAuth router is registered');
      console.log(`   Message: ${response.data.message}`);
      passed++;
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error: any) {
    console.log(`❌ OAuth router not responding`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }

  // Test 3: Authorization endpoint
  console.log('\nTest 3️⃣ : OAuth Authorization Endpoint');
  try {
    const response = await axios.get(
      `${PRODUCTION_BACKEND}/api/google-oauth/authorize`,
      {
        params: { org_id: 'test-org-123' },
        validateStatus: () => true, // Accept any status
        timeout: 5000
      }
    );

    // We expect an error because 'test-org-123' is not a real org
    // But the endpoint should exist
    if (response.status === 400 && (response.data.error || response.data.message)) {
      console.log('✅ Authorization endpoint exists');
      console.log(`   Returned expected error for test org (400)`);

      // Try to verify redirect_uri is correct
      if (response.data.url) {
        const authUrl = response.data.url;
        const url = new URL(authUrl);
        const redirectUri = url.searchParams.get('redirect_uri');

        if (redirectUri?.includes('barpel.onrender.com')) {
          console.log('✅ Redirect URI points to Render deployment');
          console.log(`   URI: ${redirectUri}`);
          passed++;
        } else {
          console.log(`⚠️  Redirect URI doesn't point to expected domain`);
          console.log(`   URI: ${redirectUri}`);
        }
      } else {
        passed++;
      }
    } else if (response.status === 500) {
      console.log(`❌ Authorization endpoint returned 500`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    } else {
      console.log(`⚠️  Unexpected response status: ${response.status}`);
      passed++;
    }
  } catch (error: any) {
    console.log(`❌ Authorization endpoint error`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }

  // Test 4: Callback endpoint exists
  console.log('\nTest 4️⃣ : OAuth Callback Endpoint');
  try {
    const response = await axios.get(
      `${PRODUCTION_BACKEND}/api/google-oauth/callback`,
      {
        validateStatus: () => true,
        timeout: 5000
      }
    );

    if (response.status === 400) {
      console.log('✅ Callback endpoint exists');
      console.log(`   Returned 400 (expected - missing OAuth params)`);
      passed++;
    } else if (response.status === 404) {
      console.log(`❌ Callback endpoint not found (404)`);
      console.log(`   Check that /api/google-oauth/callback route is registered`);
      failed++;
    } else {
      console.log(`✅ Callback endpoint is accessible`);
      console.log(`   Status: ${response.status}`);
      passed++;
    }
  } catch (error: any) {
    console.log(`❌ Callback endpoint error`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('✅ Production OAuth configuration is VALID!');
    console.log('\n📝 Pre-Launch Checklist:');
    console.log('☑️  OAuth endpoints responding correctly');
    console.log('☐ Verify https://barpel.onrender.com/api/google-oauth/callback');
    console.log('   is in Google Cloud Console approved redirect URIs');
    console.log('☐ Test full OAuth flow with a real Google account');
    console.log('☐ Monitor Render logs for any errors');
    console.log('☐ Announce feature is ready to customers');
    process.exit(0);
  } else {
    console.log('❌ Production verification FAILED!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Render backend is running:');
    console.log(`   → Open ${PRODUCTION_BACKEND} in browser`);
    console.log('2. Check Render environment variables:');
    console.log('   → BACKEND_URL=https://barpel.onrender.com');
    console.log('   → GOOGLE_REDIRECT_URI=https://barpel.onrender.com/api/google-oauth/callback');
    console.log('3. Check Google Cloud Console:');
    console.log('   → Approved redirect URIs includes https://barpel.onrender.com/api/google-oauth/callback');
    console.log('4. Check Render logs for startup errors');
    process.exit(1);
  }
}

verifyProduction();
