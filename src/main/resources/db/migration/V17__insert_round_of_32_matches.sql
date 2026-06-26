-- 16AVOS DE FINAL (ROUND_OF_32) — tiempos en hora Argentina (UTC-3)

-- Domingo 28/06 16:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-28 16:00:00'
FROM teams h, teams a
WHERE h.name = 'Sudáfrica' AND a.name = 'Canadá';

-- Lunes 29/06 14:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-29 14:00:00'
FROM teams h, teams a
WHERE h.name = 'Brasil' AND a.name = 'Japón';

-- Lunes 29/06 22:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-29 22:00:00'
FROM teams h, teams a
WHERE h.name = 'Países Bajos' AND a.name = 'Marruecos';

-- Miércoles 01/07 21:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-01 21:00:00'
FROM teams h, teams a
WHERE h.name = 'Estados Unidos' AND a.name = 'Bosnia y Herzegovina';
