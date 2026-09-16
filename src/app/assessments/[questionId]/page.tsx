import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LiveEditor from '@/components/LiveEditor';

export default async function AssessmentPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const supabase = await createClient();

  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error || !question) {
    notFound();
  }

  // Check if user already submitted code for this
  const { data: { user } } = await supabase.auth.getUser();
  let initialCode = '';
  
  if (user) {
    const { data: assessment } = await supabase
      .from('assessments')
      .select('code_submitted')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (assessment?.code_submitted) {
      initialCode = assessment.code_submitted;
    }
  }

  return (
    <LiveEditor question={question} initialCode={initialCode} />
  );
}
