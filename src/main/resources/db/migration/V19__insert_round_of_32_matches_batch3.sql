-- 16AVOS DE FINAL (ROUND_OF_32) — tiempos en hora Argentina (UTC-3)

-- Lunes 29/06 17:30 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-29 17:30:00'
FROM teams h, teams a
WHERE h.name = 'Alemania' AND a.name = 'Paraguay';

-- Martes 30/06 18:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-30 18:00:00'
FROM teams h, teams a
WHERE h.name = 'Francia' AND a.name = 'Suecia';

-- Viernes 03/07 15:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-03 15:00:00'
FROM teams h, teams a
WHERE h.name = 'Australia' AND a.name = 'Egipto';

-- Viernes 03/07 19:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-03 19:00:00'
FROM teams h, teams a
WHERE h.name = 'Argentina' AND a.name = 'Cabo Verde';
