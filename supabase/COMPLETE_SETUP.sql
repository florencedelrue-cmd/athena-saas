-- Athena Duaal SaaS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (
    subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class TEXT NOT NULL DEFAULT '',
  school_year TEXT NOT NULL DEFAULT '',
  coach TEXT NOT NULL DEFAULT '',
  process_step INTEGER NOT NULL DEFAULT 1 CHECK (process_step BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

-- ============================================
-- FICHES TABLE (phase-specific notes)
-- ============================================
CREATE TABLE IF NOT EXISTS fiches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fase INTEGER NOT NULL CHECK (fase BETWEEN 1 AND 5),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, fase)
);

CREATE INDEX IF NOT EXISTS idx_fiches_student_id ON fiches(student_id);

-- ============================================
-- COMPETENCIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  competency_key TEXT NOT NULL,
  score JSONB NOT NULL DEFAULT '{"m1":"nvt","m2":"nvt","m3":"nvt","note":""}',
  UNIQUE(student_id, competency_key)
);

CREATE INDEX IF NOT EXISTS idx_competencies_student_id ON competencies(student_id);

-- ============================================
-- LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  competencies_used JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_logs_student_id ON logs(student_id);

-- ============================================
-- HELPER: Get current user's school_id
-- ============================================
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiches ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- SCHOOLS policies
CREATE POLICY "Users can view their own school"
  ON schools FOR SELECT
  USING (id = get_user_school_id());

CREATE POLICY "Admins can update their school"
  ON schools FOR UPDATE
  USING (id = get_user_school_id());

-- USERS policies
CREATE POLICY "Users can view users in their school"
  ON users FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- STUDENTS policies
CREATE POLICY "Users can view students in their school"
  ON students FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can insert students in their school"
  ON students FOR INSERT
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "Users can update students in their school"
  ON students FOR UPDATE
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can delete students in their school"
  ON students FOR DELETE
  USING (school_id = get_user_school_id());

-- FICHES policies (via student school_id)
CREATE POLICY "Users can view fiches in their school"
  ON fiches FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can insert fiches in their school"
  ON fiches FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can update fiches in their school"
  ON fiches FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can delete fiches in their school"
  ON fiches FOR DELETE
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

-- COMPETENCIES policies
CREATE POLICY "Users can view competencies in their school"
  ON competencies FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can insert competencies in their school"
  ON competencies FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can update competencies in their school"
  ON competencies FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can delete competencies in their school"
  ON competencies FOR DELETE
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

-- LOGS policies
CREATE POLICY "Users can view logs in their school"
  ON logs FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can insert logs in their school"
  ON logs FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can update logs in their school"
  ON logs FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Users can delete logs in their school"
  ON logs FOR DELETE
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

-- ============================================
-- SIGNUP TRIGGER: Auto-create user record
-- (Alternative to client-side signup flow)
-- ============================================
-- Note: Signup is handled in the app via service role for school creation

-- ============================================
-- REALTIME (optional — enable in Supabase dashboard)
-- ============================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE students;
-- ALTER PUBLICATION supabase_realtime ADD TABLE logs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE competencies;
-- Planner & Lesvoorbereidingen
-- Run in Supabase SQL Editor after 001_initial_schema.sql

-- ============================================
-- LESSON PREPARATIONS (lesvoorbereidingen)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_preparations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  competencies JSONB NOT NULL DEFAULT '[]',
  student_ids JSONB NOT NULL DEFAULT '[]',
  drive_links JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_preparations_school_id ON lesson_preparations(school_id);

-- ============================================
-- PLANNER EVENTS (agenda-gebeurtenissen)
-- ============================================
CREATE TABLE IF NOT EXISTS planner_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  assignment_title TEXT NOT NULL,
  assignment_notes TEXT NOT NULL DEFAULT '',
  lesson_preparation_id UUID REFERENCES lesson_preparations(id) ON DELETE SET NULL,
  student_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planner_events_school_id ON planner_events(school_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_date ON planner_events(event_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE lesson_preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lesson preparations in their school"
  ON lesson_preparations FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can insert lesson preparations in their school"
  ON lesson_preparations FOR INSERT
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "Users can update lesson preparations in their school"
  ON lesson_preparations FOR UPDATE
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can delete lesson preparations in their school"
  ON lesson_preparations FOR DELETE
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can view planner events in their school"
  ON planner_events FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can insert planner events in their school"
  ON planner_events FOR INSERT
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "Users can update planner events in their school"
  ON planner_events FOR UPDATE
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can delete planner events in their school"
  ON planner_events FOR DELETE
  USING (school_id = get_user_school_id());
-- Athena CLW + Athena Heule — vaste scholen, geen self-service registratie
-- Run after 001_initial_schema.sql

ALTER TABLE schools ADD COLUMN IF NOT EXISTS email_domain TEXT UNIQUE;

INSERT INTO schools (name, plan, email_domain, subscription_status)
SELECT 'Athena CLW', 'pro', 'athena-clw.be', 'active'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE email_domain = 'athena-clw.be');

INSERT INTO schools (name, plan, email_domain, subscription_status)
SELECT 'Athena Heule', 'pro', 'athena-heule.be', 'active'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE email_domain = 'athena-heule.be');

-- Google Drive cursusmateriaal (lesvoorbereidingen)
ALTER TABLE lesson_preparations
  ADD COLUMN IF NOT EXISTS drive_links JSONB NOT NULL DEFAULT '[]';
