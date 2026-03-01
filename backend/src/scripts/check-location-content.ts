#!/usr/bin/env tsx
/**
 * Check Location Content - Verify if contact/location information exists in database
 */

import { config } from '../config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  config.SUPABASE_URL || '',
  config.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkLocationContent() {
  console.log('\n🔍 CHECKING LOCATION CONTENT IN DATABASE\n');

  // Get org_id
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, email')
    .ilike('email', '%barpel@demo.com%')
    .limit(1);

  if (!orgs || orgs.length === 0) {
    console.log('❌ Organization not found');
    return;
  }

  const orgId = orgs[0].id;
  console.log(`📋 Organization: ${orgs[0].email} (${orgId})\n`);

  // Check all knowledge base documents
  const { data: kbDocs } = await supabase
    .from('knowledge_base')
    .select('id, filename, content')
    .eq('org_id', orgId)
    .order('filename');

  console.log(`📚 Knowledge Base Documents in Database (${kbDocs?.length || 0} total):\n`);

  for (const doc of kbDocs || []) {
    console.log(`  📄 ${doc.filename}`);
    const contentPreview = doc.content.substring(0, 100).replace(/\n/g, ' ');
    console.log(`     Preview: ${contentPreview}...\n`);
  }

  // Check chunks for contact information
  const { data: chunks } = await supabase
    .from('knowledge_base_chunks')
    .select('id, content, knowledge_base_id')
    .eq('org_id', orgId);

  console.log(`\n📦 Total Chunks in Database: ${chunks?.length || 0}\n`);

  // Search for location-related content
  const locationChunks = chunks?.filter(c =>
    c.content.toLowerCase().includes('location') ||
    c.content.toLowerCase().includes('address') ||
    c.content.toLowerCase().includes('london') ||
    c.content.toLowerCase().includes('innovation drive') ||
    c.content.toLowerCase().includes('headquarters') ||
    c.content.toLowerCase().includes('contact')
  );

  console.log(`🔍 Chunks with Location/Contact Keywords: ${locationChunks?.length || 0}\n`);

  if (locationChunks && locationChunks.length > 0) {
    for (const chunk of locationChunks) {
      console.log(`  ✅ Chunk ID: ${chunk.id}`);
      console.log(`     Content: ${chunk.content.substring(0, 300)}`);
      console.log('');
    }
  } else {
    console.log('  ❌ No chunks found with location/contact information');
    console.log('  📝 This explains why the location query failed!\n');
  }

  // Check if contact_knowledge_base.md exists
  const contactDoc = kbDocs?.find(doc =>
    doc.filename.toLowerCase().includes('contact')
  );

  if (contactDoc) {
    console.log('✅ Contact knowledge base document EXISTS in database');
    console.log(`   Filename: ${contactDoc.filename}`);
    console.log(`   Has content: ${contactDoc.content.length > 0 ? 'YES' : 'NO'}`);
    console.log(`   Content length: ${contactDoc.content.length} chars\n`);
  } else {
    console.log('❌ Contact knowledge base document NOT FOUND in database');
    console.log('   This file needs to be uploaded!\n');
  }
}

checkLocationContent().catch(console.error);
