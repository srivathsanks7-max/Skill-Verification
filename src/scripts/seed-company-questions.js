const { createClient } = require('@supabase/supabase-js');

// Load environment variables directly since we are running as a standalone node script
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCompanyQuestions() {
  const newQuestions = [
    {
      id: 'q-stripe-1',
      title: 'Valid Credit Card Validator',
      description: 'Write a function that takes a string of digits and validates if it is a valid credit card number using the Luhn algorithm. Return true or false.',
      language: 'javascript',
      test_cases: [
        { input: '49927398716', expected_output: 'true' }
      ]
    },
    {
      id: 'q-google-1',
      title: 'Merge K Sorted Lists',
      description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it as an array.',
      language: 'javascript',
      test_cases: [
        { input: '[[1,4,5],[1,3,4],[2,6]]', expected_output: '[1,1,2,3,4,4,5,6]' }
      ]
    }
  ];

  console.log('Seeding company questions...');
  
  for (const q of newQuestions) {
    const { error } = await supabase.from('questions').upsert(q);
    if (error) {
      console.error(`Error inserting ${q.title}:`, error);
    } else {
      console.log(`Successfully seeded ${q.title}`);
    }
  }
}

seedCompanyQuestions();
