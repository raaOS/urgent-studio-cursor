-- Add is_active column to users table
-- Migration to add missing is_active column

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create index for is_active if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'idx_users_is_active'
    ) THEN
        CREATE INDEX idx_users_is_active ON users(is_active);
    END IF;
END $$;

-- Update existing users to have is_active = true if NULL
UPDATE users SET is_active = true WHERE is_active IS NULL;