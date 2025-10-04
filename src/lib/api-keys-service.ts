/**
 * API Keys Service - Secure Management of API Keys from Supabase
 * 
 * This service retrieves API keys from Supabase instead of environment variables.
 * Keys are cached in memory for performance and refreshed periodically.
 * 
 * SECURITY NOTES:
 * - Only use this from server-side code (API routes, server actions)
 * - Never expose API keys to client-side code
 * - Use SUPABASE_SERVICE_ROLE_KEY for database access (not anon key)
 */

import { createClient } from '@supabase/supabase-js';

// Service role client for secure key access
// This bypasses RLS policies and should NEVER be exposed to client
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://siaxwbhyahlshwqzvafe.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. API key retrieval may fail.');
    // Fallback to anon key (limited functionality)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYXh3Ymh5YWhsc2h3cXp2YWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjYwMzAsImV4cCI6MjA3NDc0MjAzMH0.PfjNCyUdsK7oqMeAPNF60DyPQyCeZGIj8aQe5tRQTOA';
    return createClient(supabaseUrl, anonKey);
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// In-memory cache for API keys
interface CachedKey {
  value: string;
  timestamp: number;
  expiresAt: number;
}

const keyCache = new Map<string, CachedKey>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_TO_ENV = true; // Allow fallback to environment variables

/**
 * Get an API key from Supabase (with caching and fallback)
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  // Check cache first
  const cached = keyCache.get(keyName);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  try {
    const supabase = getServiceClient();
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('api_keys')
      .select('key_value, is_active')
      .eq('key_name', keyName)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`❌ Error fetching API key '${keyName}':`, error.message);
      
      // Fallback to environment variable
      if (FALLBACK_TO_ENV) {
        console.warn(`⚠️  Falling back to environment variable for '${keyName}'`);
        return getFallbackKey(keyName);
      }
      return null;
    }

    if (!data?.key_value) {
      console.warn(`⚠️  API key '${keyName}' not found in database`);
      
      // Fallback to environment variable
      if (FALLBACK_TO_ENV) {
        return getFallbackKey(keyName);
      }
      return null;
    }

    // Cache the key
    keyCache.set(keyName, {
      value: data.key_value,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS
    });

    // Track access (fire-and-forget)
    trackKeyAccess(keyName).catch(err => 
      console.error('Failed to track key access:', err)
    );

    return data.key_value;
  } catch (error) {
    console.error(`❌ Exception fetching API key '${keyName}':`, error);
    
    // Fallback to environment variable
    if (FALLBACK_TO_ENV) {
      return getFallbackKey(keyName);
    }
    return null;
  }
}

/**
 * Fallback to environment variables (legacy support)
 */
function getFallbackKey(keyName: string): string | null {
  const envValue = process.env[keyName];
  if (envValue) {
    console.log(`✅ Using environment variable for '${keyName}'`);
    return envValue;
  }
  console.warn(`⚠️  No fallback found for '${keyName}'`);
  return null;
}

/**
 * Track API key access (analytics)
 */
async function trackKeyAccess(keyName: string): Promise<void> {
  try {
    const supabase = getServiceClient();
    
    await supabase
      .from('api_keys')
      .update({ 
        last_accessed_at: new Date().toISOString()
      })
      .eq('key_name', keyName);
  } catch (error) {
    // Silent fail - tracking is not critical
  }
}

/**
 * Get multiple API keys at once (batch retrieval)
 */
export async function getApiKeys(keyNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  
  await Promise.all(
    keyNames.map(async (keyName) => {
      results[keyName] = await getApiKey(keyName);
    })
  );
  
  return results;
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearKeyCache(): void {
  keyCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: keyCache.size,
    keys: Array.from(keyCache.keys()),
    entries: Array.from(keyCache.entries()).map(([key, value]) => ({
      key,
      expiresIn: Math.max(0, value.expiresAt - Date.now()),
      age: Date.now() - value.timestamp
    }))
  };
}

/**
 * Convenience methods for specific keys
 */
export const ApiKeys = {
  getOpenRouterKey: () => getApiKey('OPENROUTER_API_KEY'),
  getSentinelHubClientId: () => getApiKey('SENTINEL_HUB_CLIENT_ID'),
  getSentinelHubClientSecret: () => getApiKey('SENTINEL_HUB_CLIENT_SECRET'),
  getSentinelHubInstanceId: () => getApiKey('SENTINEL_HUB_INSTANCE_ID'),
  getNasaApiKey: () => getApiKey('NASA_API_KEY'),
  getEarthdataBearerToken: () => getApiKey('EARTHDATA_BEARER_TOKEN'),
  getEarthdataClientId: () => getApiKey('EARTHDATA_CLIENT_ID'),
  getGoogleMapsApiKey: () => getApiKey('GOOGLE_MAPS_API_KEY'),
  getGeminiApiKey: () => getApiKey('GEMINI_API_KEY'),
};

export default ApiKeys;
