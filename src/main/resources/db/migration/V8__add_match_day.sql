-- Add match_day column to track matchday within GROUP_STAGE
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_day INTEGER;

-- Matchday 1: June 11–17
UPDATE matches
SET match_day = 1
WHERE stage = 'GROUP_STAGE'
  AND date_time < TIMESTAMP '2026-06-18 00:00:00';

-- Matchday 2: June 18–23
UPDATE matches
SET match_day = 2
WHERE stage = 'GROUP_STAGE'
  AND date_time >= TIMESTAMP '2026-06-18 00:00:00'
  AND date_time < TIMESTAMP '2026-06-24 00:00:00';

-- Matchday 3: June 24+
UPDATE matches
SET match_day = 3
WHERE stage = 'GROUP_STAGE'
  AND date_time >= TIMESTAMP '2026-06-24 00:00:00';
