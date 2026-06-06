const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uwofuysnqjztduvkqkmc.supabase.co';
const supabaseKey = 'sb_publishable_jZCdDk4_zG8ChleS4SN2Lg_MOOm7Z48';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllFiles(bucket, path = '') {
  const { data, error } = await supabase.storage.from(bucket).list(path, { limit: 100 });
  if (error) {
    throw error;
  }
  
  let files = [];
  for (const item of data || []) {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    if (!item.id) {
      // It's a folder, list recursively
      const subFiles = await listAllFiles(bucket, fullPath);
      files = files.concat(subFiles);
    } else {
      // It's a file
      files.push({
        name: fullPath,
        size: item.metadata?.size || 0
      });
    }
  }
  return files;
}

async function run() {
  console.log('Starting recursive file listing...');
  try {
    const files = await listAllFiles('gallery');
    console.log(`Success! Found ${files.length} files:`);
    console.log(files);
    
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    console.log(`Total Size: ${totalSize} bytes (${(totalSize / (1024 * 1024)).toFixed(3)} MB)`);
  } catch (error) {
    console.error('Error listing files recursively:', error.message);
  }
}

run();
