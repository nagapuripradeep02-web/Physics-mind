-- Add concept_panel_config row for vector_addition
-- Routes vector_addition to the mechanics_2d renderer instead of defaulting to particle_field

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('vector_addition', 'mechanics_2d', 'canvas2d', 1, '11', 'Vectors')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer = EXCLUDED.panel_a_renderer,
  technology_a = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level = EXCLUDED.class_level,
  chapter = EXCLUDED.chapter;
