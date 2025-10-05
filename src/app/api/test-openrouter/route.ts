import { NextResponse } from 'next/server';
import { ApiKeys } from '@/lib/api-keys-service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[Diagnostic] Checking OpenRouter API key...');
    
    const apiKey = await ApiKeys.getOpenRouterKey();
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenRouter API key not found',
        message: 'Please add OPENROUTER_API_KEY to Supabase api_keys table or environment variables',
        checked: [
          'Supabase: api_keys table → key_name=OPENROUTER_API_KEY',
          'Environment: process.env.OPENROUTER_API_KEY',
          'Environment: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY'
        ]
      }, { status: 500 });
    }
    
    const keyPreview = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
    
    console.log(`[Diagnostic] OpenRouter key found: ${keyPreview}`);
    
    return NextResponse.json({
      success: true,
      message: 'OpenRouter API key configured correctly',
      keyPreview,
      keyLength: apiKey.length,
      hint: 'OpenRouter keys typically start with "sk-or-..."'
    });
    
  } catch (error) {
    console.error('[Diagnostic] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
