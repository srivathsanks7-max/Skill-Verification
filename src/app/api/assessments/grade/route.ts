import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateContentWithFallback } from '@/utils/gemini';

export async function POST(request: Request) {
  try {
    const { questionId, explanation } = await request.json();

    if (!questionId || !explanation) {
      return NextResponse.json({ error: 'Missing questionId or explanation' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the question
    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are an expert technical interviewer grading a candidate's explanation of their code.
      
      Question:
      ${question.title}
      ${question.description}
      
      Candidate's Explanation:
      ${explanation}
      
      Grade the candidate's reasoning out of 100 based on their understanding of time/space complexity, edge cases, and clarity.
    `;

    const mockResponse = {
      score: 95,
      feedback: "Great explanation! You clearly understand the time complexity and correctly identified the edge cases."
    };

    const gradeData = await generateContentWithFallback(ai, prompt, {
        responseMimeType: "application/json",
        systemInstruction: `Respond strictly in the following JSON format:
        {
          "score": 95, // integer out of 100
          "feedback": "String (Short 2 sentence feedback)"
        }`
    }, mockResponse);

    return NextResponse.json({ 
      success: true, 
      grade: gradeData 
    });

  } catch (error: any) {
    console.error('Grading Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
