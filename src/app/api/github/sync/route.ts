import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Octokit } from 'octokit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the provider token (GitHub access token) from the session
    const { data: { session } } = await supabase.auth.getSession();
    const providerToken = session?.provider_token;

    if (!providerToken) {
      return NextResponse.json({ error: 'GitHub provider token not found. Please log in with GitHub again.' }, { status: 400 });
    }

    const octokit = new Octokit({ auth: providerToken });
    
    // Fetch GitHub user data
    const { data: githubUser } = await octokit.rest.users.getAuthenticated();
    
    // Fetch user's repos
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 10,
    });

    const repoData = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
    }));

    // Aggregate languages
    const languages = repos
      .map(r => r.language)
      .filter((lang): lang is string => Boolean(lang));
    
    const uniqueLanguages = Array.from(new Set(languages));

    const githubStats = {
      repos: repoData,
      top_languages: uniqueLanguages,
      followers: githubUser.followers,
      public_repos: githubUser.public_repos,
    };

    // Update the profile in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: githubUser.login,
        full_name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        github_stats: githubStats,
      });

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: { username: githubUser.login, github_stats: githubStats } });

  } catch (error: any) {
    console.error('Error in GitHub sync:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
