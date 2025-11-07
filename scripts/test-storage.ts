// Quick test script to verify Supabase Storage setup
// Run with: npx tsx scripts/test-storage.ts

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL!;
const key = process.env.VITE_SUPABASE_ANON_KEY!;

if (!url || !key) {
  console.error('❌ Missing environment variables!');
  console.log('Make sure .env.local has:');
  console.log('  VITE_SUPABASE_URL=...');
  console.log('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testStorage() {
  console.log('\n🔍 Testing Supabase Storage Setup...\n');

  // 1. List buckets
  console.log('1. Checking buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('❌ Failed to list buckets:', bucketsError.message);
    return;
  }
  console.log('✅ Found buckets:', buckets.map(b => b.name).join(', '));
  
  const hasProjectMedia = buckets.some(b => b.name === 'project-media');
  if (!hasProjectMedia) {
    console.error('❌ "project-media" bucket not found!');
    console.log('   Create it in Supabase Dashboard → Storage → New bucket');
    return;
  }
  console.log('✅ "project-media" bucket exists');

  // 2. List files in bucket
  console.log('\n2. Checking files in project-media...');
  const { data: files, error: filesError } = await supabase.storage
    .from('project-media')
    .list('projects', { limit: 10 });
  
  if (filesError) {
    console.error('❌ Failed to list files:', filesError.message);
    console.log('   This might be a policy issue');
  } else {
    console.log(`✅ Found ${files.length} project folders`);
    if (files.length > 0) {
      console.log('   Folders:', files.map(f => f.name).join(', '));
    }
  }

  // 3. Test signed URL generation
  console.log('\n3. Testing signed URL generation...');
  if (files && files.length > 0) {
    // Try to list files in first project folder
    const firstFolder = files[0].name;
    const { data: projectFiles } = await supabase.storage
      .from('project-media')
      .list(`projects/${firstFolder}`);
    
    if (projectFiles && projectFiles.length > 0) {
      const testPath = `projects/${firstFolder}/${projectFiles[0].name}`;
      console.log(`   Testing path: ${testPath}`);
      
      const { data: signedData, error: signedError } = await supabase.storage
        .from('project-media')
        .createSignedUrl(testPath, 60);
      
      if (signedError) {
        console.error('❌ Failed to create signed URL:', signedError.message);
        console.log('   Check Storage policies in Supabase Dashboard');
      } else {
        console.log('✅ Signed URL created successfully!');
        console.log('   URL:', signedData.signedUrl.substring(0, 80) + '...');
      }
    } else {
      console.log('⚠️  No files found to test signed URLs');
    }
  }

  // 4. Check project_images table
  console.log('\n4. Checking project_images table...');
  const { data: images, error: imagesError } = await supabase
    .from('project_images')
    .select('id, storage_path, project_id')
    .limit(5);
  
  if (imagesError) {
    console.error('❌ Failed to query project_images:', imagesError.message);
    console.log('   Run the SQL from supabase-schema.sql');
  } else {
    console.log(`✅ Found ${images.length} image records in database`);
    if (images.length > 0) {
      console.log('   Sample paths:');
      images.forEach(img => {
        console.log(`   - ${img.storage_path}`);
      });
    } else {
      console.log('   ⚠️  No images in database yet (upload some via admin panel)');
    }
  }

  console.log('\n✅ Storage test complete!\n');
}

testStorage().catch(e => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
