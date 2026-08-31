-- Koppel planner-gebeurtenissen aan logboeknotities per leerling
ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS planner_event_id UUID REFERENCES planner_events(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_logs_planner_event_id ON logs(planner_event_id);
