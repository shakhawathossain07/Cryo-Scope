-- API Keys Storage Table
-- This table stores all API keys and secrets securely in Supabase
-- Use Row Level Security (RLS) to restrict access

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT UNIQUE NOT NULL,
  key_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key_name ON api_keys(key_name) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to read all keys
-- WARNING: This should only be accessed from server-side code with service role key
CREATE POLICY "Service role can read all keys" ON api_keys
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Create a policy for updating access tracking
CREATE POLICY "Service role can update keys" ON api_keys
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Create a policy for inserting new keys
CREATE POLICY "Service role can insert keys" ON api_keys
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Function to update last_accessed_at timestamp
CREATE OR REPLACE FUNCTION update_api_key_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = NOW();
  NEW.access_count = OLD.access_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track access
CREATE TRIGGER track_api_key_access
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  WHEN (OLD.last_accessed_at IS DISTINCT FROM NEW.last_accessed_at)
  EXECUTE FUNCTION update_api_key_access();

-- Insert initial API keys (run this separately with actual values)
-- You should run these INSERT statements from Supabase dashboard or with service role key

/*
INSERT INTO api_keys (key_name, key_value, description) VALUES
  ('OPENROUTER_API_KEY', 'your_openrouter_key_here', 'OpenRouter API for AI report generation'),
  ('SENTINEL_HUB_CLIENT_ID', 'your_sentinel_client_id_here', 'Sentinel Hub OAuth Client ID'),
  ('SENTINEL_HUB_CLIENT_SECRET', 'your_sentinel_secret_here', 'Sentinel Hub OAuth Client Secret'),
  ('SENTINEL_HUB_INSTANCE_ID', 'c3a5b168-3586-40fd-8529-038154197e16', 'Sentinel Hub Configuration Instance'),
  ('NASA_API_KEY', 'your_nasa_key_here', 'NASA POWER API Key'),
  ('EARTHDATA_BEARER_TOKEN', 'your_earthdata_token_here', 'NASA Earthdata Bearer Token'),
  ('EARTHDATA_CLIENT_ID', 'cryo-scope-app', 'NASA Earthdata Client ID'),
  ('GOOGLE_MAPS_API_KEY', 'your_google_maps_key_here', 'Google Maps JavaScript API Key'),
  ('GEMINI_API_KEY', 'your_gemini_key_here', 'Google Gemini API Key (legacy)')
ON CONFLICT (key_name) DO NOTHING;
*/

-- Create a view for non-sensitive key information (optional)
CREATE OR REPLACE VIEW api_keys_info AS
SELECT 
  id,
  key_name,
  description,
  is_active,
  created_at,
  last_accessed_at,
  access_count
FROM api_keys
ORDER BY key_name;

COMMENT ON TABLE api_keys IS 'Secure storage for API keys and secrets';
COMMENT ON COLUMN api_keys.key_value IS 'Encrypted API key value - handle with care';
