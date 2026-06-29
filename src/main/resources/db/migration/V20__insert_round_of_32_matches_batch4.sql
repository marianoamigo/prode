-- 16AVOS DE FINAL (ROUND_OF_32) — tiempos en hora Argentina (UTC-3)

-- Martes 30/06 22:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-06-30 22:00:00'
FROM teams h, teams a
WHERE h.name = 'México' AND a.name = 'Ecuador';

-- Miércoles 01/07 13:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-01 13:00:00'
FROM teams h, teams a
WHERE h.name = 'Inglaterra' AND a.name = 'R. D. del Congo';

-- Miércoles 01/07 17:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-01 17:00:00'
FROM teams h, teams a
WHERE h.name = 'Bélgica' AND a.name = 'Senegal';

-- Jueves 02/07 16:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-02 16:00:00'
FROM teams h, teams a
WHERE h.name = 'España' AND a.name = 'Austria';

-- Jueves 02/07 20:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-02 20:00:00'
FROM teams h, teams a
WHERE h.name = 'Portugal' AND a.name = 'Croacia';

-- Viernes 03/07 00:00 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-03 00:00:00'
FROM teams h, teams a
WHERE h.name = 'Suiza' AND a.name = 'Argelia';

-- Viernes 03/07 22:30 hs Argentina
INSERT INTO matches(id, home_team_id, away_team_id, stage, status, date_time)
SELECT gen_random_uuid(), h.id, a.id, 'ROUND_OF_32', 'SCHEDULED', TIMESTAMP '2026-07-03 22:30:00'
FROM teams h, teams a
WHERE h.name = 'Colombia' AND a.name = 'Ghana';
