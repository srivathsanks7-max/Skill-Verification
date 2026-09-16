import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateContentWithFallback } from '@/utils/gemini';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    // Fetch the user's profile which contains github_stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_stats')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.github_stats) {
      return NextResponse.json({ error: 'No GitHub stats found to analyze' }, { status: 400 });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are an expert Technical Career Copilot. Analyze the following GitHub portfolio data for a candidate.
      
      GitHub Stats:
      ${JSON.stringify(profile.github_stats, null, 2)}
      
      Based on the repositories, their names, descriptions, and languages, infer the candidate's technical profile.
      Since you don't have the full code, make educated guesses about their likely strengths (based on what they build) and likely weaknesses (based on what is missing or simple).
      
      Generate a 'Weekly Focus' actionable item. E.g., "Spend 20 minutes this week adding Testing to your React projects" or "Try building a project with Docker since you have no evidence of containerization".
    `;

    const mockResponse = {
      strengths: ["Problem Solving", "Full Stack Development"],
      weaknesses: ["Testing", "CI/CD"],
      common_stack: ["JavaScript", "React", "Node.js"],
      weekly_focus: "Since you have no evidence of automated testing, try adding Jest or Cypress to your top repositories this week to stand out to employers."
    };

    const analysisData = await generateContentWithFallback(ai, prompt, {
        responseMimeType: "application/json",
        systemInstruction: `Respond strictly in the following JSON format:
        {
          "strengths": ["String", "String"],
          "weaknesses": ["String", "String"],
          "common_stack": ["String", "String"],
          "weekly_focus": "String (A specific, actionable paragraph explaining what to improve this week and why based on their repos)"
        }`
    }, mockResponse);
    
    // Save to database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ analysis_data: analysisData })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, analysis_data: analysisData });

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze github' }, { status: 500 });
  }
}
