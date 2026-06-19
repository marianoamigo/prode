-- Turquía vs Paraguay was incorrectly set to 2026-06-19 00:00:00, correct date is 2026-06-20 00:00:00
UPDATE matches
SET date_time  = TIMESTAMP '2026-06-20 00:00:00',
    status     = 'SCHEDULED',
    home_score = NULL,
    away_score = NULL,
    time_elapsed = NULL
WHERE home_team_id = (SELECT id FROM teams WHERE name = 'Turquía')
  AND away_team_id = (SELECT id FROM teams WHERE name = 'Paraguay');
