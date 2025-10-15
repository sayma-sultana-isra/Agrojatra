/*
  # Create skill_matches table

  1. New Tables
    - `skill_matches`
      - `id` (uuid, primary key) - Unique identifier for the match record
      - `student_id` (text) - MongoDB ObjectId of the student
      - `job_id` (text) - MongoDB ObjectId of the job posting
      - `matched_skills` (text array) - Array of skills that matched between student and job
      - `match_percentage` (numeric) - Percentage of job skills that the student has (0-100)
      - `total_job_skills` (integer) - Total number of skills required by the job
      - `student_matching_skills_count` (integer) - Number of student skills that match job requirements
      - `created_at` (timestamptz) - When the match was calculated
      - `updated_at` (timestamptz) - When the match was last updated

  2. Security
    - Enable RLS on `skill_matches` table
    - Add policy for students to read their own skill matches
    - Add policy for employers to read skill matches for their jobs
    - Add policy for authenticated users to insert/update skill matches

  3. Indexes
    - Add index on student_id for efficient student match lookups
    - Add index on job_id for efficient job match lookups
    - Add index on match_percentage for sorting by match quality
*/

CREATE TABLE IF NOT EXISTS skill_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  job_id text NOT NULL,
  matched_skills text[] DEFAULT '{}',
  match_percentage numeric(5,2) DEFAULT 0.00,
  total_job_skills integer DEFAULT 0,
  student_matching_skills_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint to prevent duplicate matches
CREATE UNIQUE INDEX IF NOT EXISTS skill_matches_student_job_unique 
  ON skill_matches(student_id, job_id);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_skill_matches_student_id ON skill_matches(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_matches_job_id ON skill_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_skill_matches_percentage ON skill_matches(match_percentage DESC);

-- Enable Row Level Security
ALTER TABLE skill_matches ENABLE ROW LEVEL SECURITY;

-- Policy for students to read their own matches
CREATE POLICY "Students can view their own skill matches"
  ON skill_matches FOR SELECT
  TO authenticated
  USING (student_id = current_setting('app.student_id', true));

-- Policy for employers to view matches for their jobs
CREATE POLICY "Employers can view matches for their jobs"
  ON skill_matches FOR SELECT
  TO authenticated
  USING (job_id = current_setting('app.job_id', true));

-- Policy for authenticated users to insert matches
CREATE POLICY "Authenticated users can create skill matches"
  ON skill_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update matches
CREATE POLICY "Authenticated users can update skill matches"
  ON skill_matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_skill_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
DROP TRIGGER IF EXISTS skill_matches_updated_at ON skill_matches;
CREATE TRIGGER skill_matches_updated_at
  BEFORE UPDATE ON skill_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_matches_updated_at();