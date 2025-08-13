#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createPdfUploadsBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'pdf-uploads');

    if (bucketExists) {
      console.log('✅ Bucket "pdf-uploads" already exists');
      
      // Update bucket to ensure it's public
      const { data: updateData, error: updateError } = await supabase
        .storage
        .updateBucket('pdf-uploads', {
          public: true,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 52428800 // 50MB
        });

      if (updateError) {
        console.error('❌ Error updating bucket:', updateError);
      } else {
        console.log('✅ Bucket "pdf-uploads" updated to public access');
      }
    } else {
      // Create new bucket
      const { data, error } = await supabase
        .storage
        .createBucket('pdf-uploads', {
          public: true,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 52428800 // 50MB
        });

      if (error) {
        console.error('❌ Error creating bucket:', error);
      } else {
        console.log('✅ Successfully created public bucket "pdf-uploads"');
        console.log('   - Public access: Yes');
        console.log('   - Allowed types: PDF only');
        console.log('   - Max file size: 50MB');
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createPdfUploadsBucket();