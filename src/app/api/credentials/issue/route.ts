import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the assessment and ensure it belongs to the user and is 'passed'
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, questions(title, language)')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.status !== 'passed') {
      return NextResponse.json({ error: 'Cannot issue credential for unpassed assessment' }, { status: 400 });
    }

    // Check if credential already exists
    const { data: existingCredential } = await supabase
      .from('credentials')
      .select('id')
      .eq('assessment_id', assessmentId)
      .single();

    if (existingCredential) {
      return NextResponse.json({ credentialId: existingCredential.id });
    }

    // Generate JWT
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const jwt = await new SignJWT({
      user_id: user.id,
      assessment_id: assessment.id,
      skill: assessment.questions.title,
      language: assessment.questions.language,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('SkillProof')
      .sign(secretKey);

    // Using the service role client to insert since RLS blocks normal users from inserting
    const supabaseAdmin = createClient();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // We have to bypass RLS to insert into credentials, so we use a fetch call with the service role key
    // Alternatively, we can just use the supabase admin client if we initialize it with the service key.
    // Let's just create a new admin client directly.
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: insertedCredential, error: insertError } = await adminSupabase
      .from('credentials')
      .insert({
        user_id: user.id,
        assessment_id: assessment.id,
        jwt_token: jwt
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving credential:', insertError);
      return NextResponse.json({ error: 'Failed to issue credential' }, { status: 500 });
    }

    return NextResponse.json({ credentialId: insertedCredential.id });

  } catch (error: any) {
    console.error('Credential Issue Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
