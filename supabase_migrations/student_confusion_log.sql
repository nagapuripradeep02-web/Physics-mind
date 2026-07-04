CREATE TABLE student_confusion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  confusion_text TEXT,
  extracted_concept_id TEXT,
  extracted_intent TEXT,
  simulation_served TEXT,
  student_rating SMALLINT,
  was_extraction_correct BOOLEAN,
  source_type TEXT,
  image_uploaded BOOLEAN,
  confidence_score FLOAT,
  session_id TEXT,
  class_level TEXT,
  exam_mode TEXT
);

-- Enable RLS
ALTER TABLE student_confusion_log ENABLE ROW LEVEL SECURITY;

-- Allow inserts for authenticated users
CREATE POLICY "Allow inserts for authenticated users" 
ON student_confusion_log 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Also optionally allow anonymous insert if your app relies on anon roles, you might need:
-- CREATE POLICY "Allow inserts for anon users" on student_confusion_log FOR INSERT TO anon WITH CHECK (true);

-- Add index on extracted_concept_id
CREATE INDEX idx_student_confusion_log_concept_id ON student_confusion_log(extracted_concept_id);
