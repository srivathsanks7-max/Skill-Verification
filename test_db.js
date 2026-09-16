const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('assessments').insert({ 
    user_id: 'ff6e45c4-7b7d-454d-819b-d63f51af8008', 
    question_id: 'f86d928c-60f7-4aa3-9469-b07229b929b9', 
    status: 'pending', 
    code: '' 
  }).select(); 
  
  console.log('Error:', error);
  console.log('Data:', data);
}

run();
