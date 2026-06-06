const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uwofuysnqjztduvkqkmc.supabase.co';
const supabaseKey = 'sb_publishable_jZCdDk4_zG8ChleS4SN2Lg_MOOm7Z48';

// Client for public schema
const supabase = createClient(supabaseUrl, supabaseKey);

// Client for storage schema
const supabaseStorage = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'storage' }
});

async function run() {
  console.log('--- Method 1: Querying storage.objects table ---');
  const { data: objects, error: objError } = await supabaseStorage
    .from('objects')
    .select('name, metadata, id')
    .eq('bucket_id', 'gallery');
    
  if (objError) {
    console.error('Method 1 error:', objError.message, objError.details);
  } else {
    console.log(`Method 1 success! Found ${objects.length} objects.`);
    if (objects.length > 0) {
      console.log('Sample object:', objects[0]);
      console.log('Metadata keys of sample object:', Object.keys(objects[0].metadata || {}));
    }
  }

  console.log('\n--- Method 2: Listing files via storage.list() API ---');
  const { data: rootList, error: rootError } = await supabase.storage.from('gallery').list('', { limit: 100 });
  if (rootError) {
    console.error('Method 2 root error:', rootError.message);
  } else {
    console.log('Root folders:', rootList.map(item => item.name));
    
    // Test listing a subfolder if folder exists
    const folders = rootList.filter(item => !item.id); // folders have no id in list response
    if (folders.length > 0) {
      const folderName = folders[0].name;
      console.log(`Listing subfolder: ${folderName}`);
      const { data: subList, error: subError } = await supabase.storage.from('gallery').list(folderName, { limit: 100 });
      if (subError) {
        console.error(`Error listing ${folderName}:`, subError.message);
      } else {
        console.log(`Subfolder ${folderName} contents:`, subList.map(item => ({ name: item.name, isFolder: !item.id, size: item.metadata?.size })));
      }
    }
  }
}

run();
