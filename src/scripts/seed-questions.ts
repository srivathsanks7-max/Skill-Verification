import { createClient } from '@supabase/supabase-js';

const questions = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Your code MUST print exactly the resulting array to stdout using console.log() (e.g. \`[ 0, 1 ]\`).`,
    language: 'javascript',
    test_cases: [
      { input: '[2,7,11,15]\n9', expected_output: '[ 0, 1 ]' }
    ]
  },
  {
    title: 'Reverse String',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

Example 1:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Your code MUST print exactly the resulting array to stdout using console.log().`,
    language: 'javascript',
    test_cases: [
      { input: '["h","e","l","l","o"]', expected_output: "[ 'o', 'l', 'l', 'e', 'h' ]" }
    ]
  }
];

async function seedQuestions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Seeding demo questions...');

  const { error } = await supabase.from('questions').insert(questions);

  if (error) {
    console.error('Error seeding questions:', error);
  } else {
    console.log('Successfully seeded questions!');
  }
}

seedQuestions();
