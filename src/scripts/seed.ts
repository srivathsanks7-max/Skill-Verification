import { createClient } from '@supabase/supabase-js';

const githubStats = {
  followers: 1254,
  public_repos: 42,
  top_languages: ['TypeScript', 'Python', 'Rust', 'Go'],
  repos: [
    {
      id: 1,
      name: 'smart-portfolio',
      description: 'An AI-powered portfolio builder that syncs with GitHub.',
      html_url: 'https://github.com/demo/smart-portfolio',
      language: 'TypeScript',
      stargazers_count: 532
    },
    {
      id: 2,
      name: 'rust-microservices',
      description: 'High performance microservices architecture built in Rust.',
      html_url: 'https://github.com/demo/rust-microservices',
      language: 'Rust',
      stargazers_count: 310
    },
    {
      id: 3,
      name: 'go-api-gateway',
      description: 'A custom API gateway implementation in Go.',
      html_url: 'https://github.com/demo/go-api-gateway',
      language: 'Go',
      stargazers_count: 154
    },
    {
      id: 4,
      name: 'ml-pipeline',
      description: 'End-to-end machine learning pipeline using Python.',
      html_url: 'https://github.com/demo/ml-pipeline',
      language: 'Python',
      stargazers_count: 89
    }
  ]
};

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Creating demo user in auth...');

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'demo@smartportfolio.com',
    password: 'password123',
    email_confirm: true,
  });

  if (authError) {
    if (authError.code === 'email_exists' || authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      console.log('Demo user already exists in auth.');
    } else {
      console.error('Error creating demo user:', authError);
      return;
    }
  }

  // If the user already existed, we need to fetch their ID. Otherwise, use the new ID.
  let demoUserId = authData?.user?.id;
  
  if (!demoUserId) {
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    if (fetchError || !users) {
      console.error('Could not fetch existing users:', fetchError);
      return;
    }
    const existingUser = users.users.find(u => u.email === 'demo@smartportfolio.com');
    if (existingUser) {
      demoUserId = existingUser.id;
    } else {
       console.error('Could not find demo user ID.');
       return;
    }
  }

  console.log(`Demo User ID: ${demoUserId}`);
  console.log('Seeding demo profile data...');

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: demoUserId,
      username: 'johndoe_demo',
      full_name: 'John Doe (Demo)',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      github_stats: githubStats,
    });

  if (error) {
    console.error('Error seeding profile:', error);
  } else {
    console.log('Successfully seeded demo profile!');
    console.log(`You can now view the demo at: http://localhost:3000/portfolio/${demoUserId}`);
  }
}

seed();
