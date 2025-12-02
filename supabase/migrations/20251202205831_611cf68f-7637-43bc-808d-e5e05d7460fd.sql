-- Create activity_type ENUM
CREATE TYPE activity_type AS ENUM (
  'run',
  'walk',
  'strength',
  'rest',
  'stretch',
  'cross_training'
);

-- Add activity_type column to activities table
ALTER TABLE activities ADD COLUMN activity_type activity_type DEFAULT 'run';