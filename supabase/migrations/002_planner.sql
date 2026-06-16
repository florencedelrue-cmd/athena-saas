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
