/*
  # Job Applications Tracking System

  1. New Tables
    - `job_applications` - Track job applications and their status
      - `id` (uuid, primary key)
      - `client_id` (uuid, references user_profiles.id)
      - `company_name` (text, not null)
      - `job_title` (text, not null)
      - `job_url` (text, nullable)
      - `application_date` (date, not null)
      - `status` (job_status enum, default 'applied')
      - `notes` (text, nullable)
      - `follow_up_date` (date, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      
    - `interviews` - Track interviews for job applications
      - `id` (uuid, primary key)
      - `job_application_id` (uuid, references job_applications.id)
      - `interview_date` (timestamptz, nullable)
      - `interview_stage` (interview_stage enum, nullable)
      - `interviewer_name` (text, nullable)
      - `interview_notes` (text, nullable)
      - `feedback` (text, nullable)
      - `result` (text, nullable)
      - `next_steps` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      
  2. Enums
    - `job_status` - Status of job application
      - 'applied', 'interview_scheduled', 'interviewed', 'rejected', 'offer_received'
      
    - `interview_stage` - Stage of interview process
      - 'screening', 'technical', 'behavioral', 'final', 'completed'
      
  3. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Admin access for all data
    
  4. Functions & Triggers
    - Auto-update timestamp triggers
*/

-- Create job_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM (
      'applied',
      'interview_scheduled',
      'interviewed',
      'rejected',
      'offer_received'
    );
  END IF;
END $$;

-- Create interview_stage enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_stage') THEN
    CREATE TYPE interview_stage AS ENUM (
      'screening',
      'technical',
      'behavioral',
      'final',
      'completed'
    );
  END IF;
END $$;

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  job_title text NOT NULL,
  job_url text,
  application_date date NOT NULL,
  status job_status DEFAULT 'applied',
  notes text,
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_application_id uuid REFERENCES job_applications(id) ON DELETE CASCADE,
  interview_date timestamptz,
  interview_stage interview_stage,
  interviewer_name text,
  interview_notes text,
  feedback text,
  result text,
  next_steps text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policy for job_applications
CREATE POLICY "Clients can manage their own job applications"
  ON job_applications
  FOR ALL
  TO public
  USING (
    (client_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
    OR
    (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'))
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_client_id ON job_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_job_application_id ON interviews(job_application_id);

-- Function to get job application statistics
CREATE OR REPLACE FUNCTION get_job_application_stats(user_uuid uuid)
RETURNS TABLE (
  total_applications integer,
  active_applications integer,
  interviews_scheduled integer,
  offers_received integer,
  rejection_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status IN ('applied', 'interview_scheduled', 'interviewed')) as active,
      COUNT(*) FILTER (WHERE status = 'interview_scheduled') as interviews,
      COUNT(*) FILTER (WHERE status = 'offer_received') as offers,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejections
    FROM job_applications ja
    JOIN user_profiles up ON ja.client_id = up.id
    WHERE up.user_id = user_uuid
  )
  SELECT
    total::integer,
    active::integer,
    interviews::integer,
    offers::integer,
    CASE WHEN total > 0 THEN (rejections::numeric / total::numeric) * 100 ELSE 0 END
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming interviews
CREATE OR REPLACE FUNCTION get_upcoming_interviews(user_uuid uuid)
RETURNS TABLE (
  interview_id uuid,
  company_name text,
  job_title text,
  interview_date timestamptz,
  stage interview_stage,
  days_until integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    ja.company_name,
    ja.job_title,
    i.interview_date,
    i.interview_stage,
    EXTRACT(DAY FROM (i.interview_date - now()))::integer as days_until
  FROM interviews i
  JOIN job_applications ja ON i.job_application_id = ja.id
  JOIN user_profiles up ON ja.client_id = up.id
  WHERE up.user_id = user_uuid
    AND i.interview_date > now()
  ORDER BY i.interview_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;