-- Initialize EvolveSync Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (already handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS evolve_sync;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'EvolveSync database initialized successfully';
END $$;