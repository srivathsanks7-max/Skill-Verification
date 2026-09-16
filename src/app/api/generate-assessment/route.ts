import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateContentWithFallback } from '@/utils/gemini';
import OpenAI from 'openai';



export async function POST(request: Request) {
  try {
    const { language, focus } = await request.json();
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key missing in environment variables' }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase Service Role Key missing in environment variables' }, { status: 500 });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const topics = ["Dynamic Programming", "Graph Traversal (BFS/DFS)", "Sliding Window", "Two Pointers", "Binary Search", "Heaps/Priority Queues", "Backtracking", "Linked Lists"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `
      You are an expert technical interviewer. Generate a HIGHLY UNIQUE Leetcode-style algorithmic coding challenge.
      The candidate's primary language is ${language || 'JavaScript'}.
      ${focus ? `CRITICAL REQUIREMENT: The candidate needs to improve in the following specific areas: ${focus}. Create a question that specifically tests these concepts.` : `Please focus the challenge primarily on this algorithmic topic: ${randomTopic}.`}
      
      Requirements:
      1. The question should be challenging but solvable in 15-30 minutes.
      2. DO NOT generate standard/basic questions like 'Two Sum', 'Palindrome', or 'FizzBuzz'. Be creative.
      3. Provide a clear title, description with examples, and 2 exact test cases.
    `;

    const mockResponse = {
      title: `Two Sum with a Twist (${Math.floor(Math.random() * 10000)})`,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Additionally, ensure your solution handles duplicate values correctly and efficiently.",
      testCases: [
        { input: "[2,7,11,15], 9", expected_output: "[0,1]" },
        { input: "[3,2,4], 6", expected_output: "[1,2]" }
      ]
    };

    const assessmentData = await generateContentWithFallback(ai, prompt, {
        responseMimeType: "application/json",
        systemInstruction: `Respond strictly in the following JSON format:
        {
          "title": "String",
          "description": "String (Markdown supported)",
          "testCases": [
            { "input": "String", "expected_output": "String" }
          ]
        }`
    }, mockResponse);
    
    // Create an admin client to bypass RLS for inserting system-generated questions
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Insert into Supabase using admin client
    const { data: newQuestion, error } = await supabaseAdmin.from('questions').insert({
      title: assessmentData.title,
      description: assessmentData.description,
      language: assessmentData.language || language || 'JavaScript',
      test_cases: assessmentData.testCases || assessmentData.test_cases || [],
    }).select().single();

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json({ error: 'Failed to save question to database: ' + error.message }, { status: 500 });
    }

    // Link the new question to the user immediately by creating a pending assessment
    const { error: assessmentError } = await supabaseAdmin.from('assessments').insert({
      user_id: user.id,
      question_id: newQuestion.id,
      status: 'pending'
    });

    if (assessmentError) {
      console.error('Assessment Link Error:', assessmentError);
      // We still return the question so they can navigate, even if linking fails (though it shouldn't)
    }

    return NextResponse.json({ question: newQuestion });

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate assessment' }, { status: 500 });
  }
}
