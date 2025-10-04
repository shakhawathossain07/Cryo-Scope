-- ============================================
-- STEP 1 OF 2: CREATE THE API KEYS TABLE
-- ============================================
-- Run this FIRST before running QUICK_INSERT_KEYS.sql
-- This creates the table structure with security policies

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

-- ============================================
-- VERIFY TABLE CREATION
-- ============================================
SELECT 
  'Table created successfully!' as status,
  COUNT(*) as row_count 
FROM api_keys;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see "Table created successfully!" above, proceed to:
-- STEP 2: Run QUICK_INSERT_KEYS.sql to insert your API keys
