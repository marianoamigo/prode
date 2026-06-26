-- Martes 30/06 14:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-30 14:00:00'
FROM teams h, teams a
WHERE h.name = 'Costa de Marfil' AND a.name = 'Noruega';
