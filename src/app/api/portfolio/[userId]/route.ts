import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Mocking Person 3's verified credentials for now
    const verifiedCredentials = [
      {
        id: 'cred-1',
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issued_at: '2023-05-12T00:00:00Z',
        url: 'https://aws.amazon.com/certification/verified'
      },
      {
        id: 'cred-2',
        title: 'Stripe Certified Professional Developer',
        issuer: 'Stripe',
        issued_at: '2024-01-20T00:00:00Z',
        url: 'https://stripe.com/docs/certification'
      }
    ];

    const portfolioData = {
      profile,
      verifiedCredentials,
    };

    return NextResponse.json(portfolioData);
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
