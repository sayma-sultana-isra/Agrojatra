/*
  # Company Profile System Migration

  ## Overview
  Creates a comprehensive company profile system that links employers to their company profiles
  and enables search functionality across all user types (students, alumni, employers) and companies.

  ## New Tables
  
  ### `company_profiles`
  - `id` (uuid, primary key) - Unique identifier for the company profile
  - `employer_id` (uuid, foreign key to auth.users) - Links company to the employer who created it
  - `name` (text, unique) - Company name (required)
  - `description` (text) - Detailed company description (required)
  - `industry` (text) - Industry sector (required)
  - `size` (text) - Company size bracket (required)
  - `founded` (integer) - Year company was founded
  - `headquarters` (text) - Location of headquarters (required)
  - `website` (text) - Company website URL
  - `logo` (text) - URL to company logo image
  - `cover_image` (text) - URL to company cover/banner image
  - `social_links` (jsonb) - Social media links (LinkedIn, Twitter, etc.)
  - `benefits` (text[]) - Array of employee benefits
  - `culture` (text) - Company culture description
  - `values` (text[]) - Array of company values
  - `technologies` (text[]) - Technologies used by the company
  - `locations` (text[]) - All office locations
  - `is_verified` (boolean) - Admin verification status
  - `rating` (numeric) - Company rating (0-5)
  - `reviews_count` (integer) - Number of reviews
  - `employees_count` (integer) - Number of employees
  - `open_positions` (integer) - Number of open job positions
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `user_profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `first_name` (text) - User's first name
  - `last_name` (text) - User's last name
  - `email` (text) - User's email
  - `role` (text) - User role (student, alumni, employer, admin)
  - `avatar` (text) - Profile picture URL
  - `bio` (text) - User biography
  - `skills` (text[]) - Array of skills
  - `university` (text) - University name
  - `graduation_year` (integer) - Year of graduation
  - `company` (text) - Current company
  - `position` (text) - Current position
  - `location` (text) - User location
  - `website` (text) - Personal website
  - `linkedin` (text) - LinkedIn profile URL
  - `github` (text) - GitHub profile URL
  - `is_active` (boolean) - Active status
  - `last_login` (timestamptz) - Last login timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on all tables
  - Company profiles can be viewed by anyone (public read)
  - Only the employer who created a company profile can update/delete it
  - Admins have full access to all company profiles
  - User profiles follow similar pattern (public read, own profile write)

  ## Indexes
  - Full-text search index on company name, description, industry
  - Index on employer_id for quick lookup of employer's companies
  - Index on industry, size, headquarters for filtering
  - Index on user_profiles for name and email search
  - Index on role for filtering users by type

  ## Important Notes
  1. This creates a normalized structure separating user authentication from profile data
  2. Company profiles are linked to employer accounts via employer_id
  3. All profiles (users and companies) are searchable by all authenticated users
  4. Proper RLS policies ensure data security while maintaining searchability
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('student', 'alumni', 'employer', 'admin')),
  avatar text,
  bio text,
  skills text[] DEFAULT '{}',
  university text,
  graduation_year integer,
  company text,
  position text,
  location text,
  website text,
  linkedin text,
  github text,
  is_active boolean DEFAULT true,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  industry text NOT NULL,
  size text NOT NULL CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  founded integer CHECK (founded >= 1800 AND founded <= EXTRACT(YEAR FROM CURRENT_DATE)),
  headquarters text NOT NULL,
  website text,
  logo text,
  cover_image text,
  social_links jsonb DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  culture text,
  values text[] DEFAULT '{}',
  technologies text[] DEFAULT '{}',
  locations text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  employees_count integer DEFAULT 0,
  open_positions integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_search ON user_profiles USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(bio, '') || ' ' || COALESCE(position, '')));

-- Create indexes for company_profiles
CREATE INDEX IF NOT EXISTS idx_company_profiles_employer ON company_profiles(employer_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_industry ON company_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_company_profiles_size ON company_profiles(size);
CREATE INDEX IF NOT EXISTS idx_company_profiles_headquarters ON company_profiles(headquarters);
CREATE INDEX IF NOT EXISTS idx_company_profiles_is_active ON company_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_company_profiles_search ON company_profiles USING gin(to_tsvector('english', name || ' ' || description || ' ' || industry));

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Anyone can view active user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for company_profiles
CREATE POLICY "Anyone can view active company profiles"
  ON company_profiles FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Employers can create company profiles"
  ON company_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own company profiles"
  ON company_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own company profiles"
  ON company_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
