-- Insert Stripe Question
INSERT INTO public.questions (id, title, description, language, test_cases)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Valid Credit Card Validator',
  'Write a function that takes a string of digits and validates if it is a valid credit card number using the Luhn algorithm. Return true or false.',
  'javascript',
  '[{"input": "49927398716", "expected_output": "true"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert Google Question
INSERT INTO public.questions (id, title, description, language, test_cases)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Merge K Sorted Lists',
  'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it as an array.',
  'javascript',
  '[{"input": "[[1,4,5],[1,3,4],[2,6]]", "expected_output": "[1,1,2,3,4,4,5,6]"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
