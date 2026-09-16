import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { generateContentWithFallback } from '@/utils/gemini';

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();
    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    // Fetch the user's analyzed profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('analysis_data, github_stats')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are an expert Technical Recruiter and Career Copilot.
      Compare the following Job Description against the Candidate's GitHub Evidence.
      
      Job Description:
      ${jobDescription.substring(0, 4000)}
      
      
      Candidate's Analyzed Profile:
      ${JSON.stringify(profile.analysis_data || {}, null, 2)}
      
      Candidate's Raw GitHub Stats (for context):
      ${JSON.stringify(profile.github_stats || {}, null, 2)}
      
      For each key technical requirement in the job description, determine if the candidate has 'strong', 'moderate', 'weak', or 'none' evidence of knowing it based on their profile.
    `;

    const mockResponse = [
      { skill: "JavaScript", status: "strong", evidence: "Found across multiple repositories with high usage." },
      { skill: "React", status: "strong", evidence: "Primary frontend framework used in featured projects." },
      { skill: "Docker", status: "none", evidence: "No evidence of containerization in any public repository." },
      { skill: "Testing", status: "weak", evidence: "Missing automated test suites in main projects." }
    ];

    const readinessData = await generateContentWithFallback(ai, prompt, {
        responseMimeType: "application/json",
        systemInstruction: `Respond strictly in the following JSON format as an array of objects:
        [
          {
            "skill": "String (e.g. React, Python, Docker)",
            "status": "String (must be exactly one of: 'strong', 'moderate', 'weak', 'none')",
            "evidence": "String (Brief 1-sentence explanation of why, referencing their github or lack thereof)"
          }
        ]`
    }, mockResponse);

    return NextResponse.json({ success: true, readiness: readinessData });

  } catch (error: any) {
    console.error('Check Readiness Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check readiness' }, { status: 500 });
  }
}
