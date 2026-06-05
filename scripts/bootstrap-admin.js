const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found in the root directory.');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    autoRefreshToken: false,
  },
});

async function bootstrap() {
  console.log('Checking administrators...');

  // Check if any admin exists
  const { data: admins, error: adminsError } = await supabase
    .from('admins')
    .select('user_id');

  if (adminsError) {
    console.error('Error querying admins table:', adminsError.message);
    console.log('Make sure you have run the migration to create the public.admins table.');
    process.exit(1);
  }

  if (admins && admins.length > 0) {
    console.log(`An administrator already exists (found ${admins.length} admin(s)). No bootstrapping required.`);
    process.exit(0);
  }

  console.log('No administrators found. Searching for users...');

  // List all users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('Error listing users from Supabase Auth:', usersError.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('No users found in Supabase Auth. Please register a user first via the website.');
    process.exit(0);
  }

  const firstUser = users[0];
  console.log(`Found user: ${firstUser.email} (ID: ${firstUser.id}). Making them administrator...`);

  // Insert into admins
  const { error: insertError } = await supabase
    .from('admins')
    .insert({ user_id: firstUser.id });

  if (insertError) {
    console.error('Failed to insert user into admins table:', insertError.message);
    process.exit(1);
  }

  console.log(`Success! User ${firstUser.email} is now registered as the first administrator.`);
}

bootstrap().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
