-- Create prompts table if it doesn't exist
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function to create the prompts table (for use in the app)
CREATE OR REPLACE FUNCTION create_prompts_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (if VITE_ENABLE_PUBLIC_ACCESS is true)
-- This allows anyone to select, insert, update, and delete prompts
CREATE POLICY "Allow public select" ON prompts
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON prompts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON prompts
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON prompts
  FOR DELETE USING (true);

-- If you want to restrict access to authenticated users only, use these policies instead:
-- (Uncomment these and comment out the public policies above)

-- CREATE POLICY "Allow authenticated select" ON prompts
--   FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated insert" ON prompts
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated update" ON prompts
--   FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated delete" ON prompts
--   FOR DELETE USING (auth.role() = 'authenticated');
