-- ============================================================
-- V21: match_number + partidos fase final (octavos a final)
-- ============================================================

ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_number INTEGER;

-- ── Asignar números 1-16 a los 16avos existentes ───────────

UPDATE matches SET match_number = 1 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Alemania' AND a.name = 'Paraguay' LIMIT 1);

UPDATE matches SET match_number = 2 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Francia' AND a.name = 'Suecia' LIMIT 1);

UPDATE matches SET match_number = 3 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Sudáfrica' AND a.name = 'Canadá' LIMIT 1);

UPDATE matches SET match_number = 4 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Países Bajos' AND a.name = 'Marruecos' LIMIT 1);

UPDATE matches SET match_number = 5 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Portugal' AND a.name = 'Croacia' LIMIT 1);

UPDATE matches SET match_number = 6 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'España' AND a.name = 'Austria' LIMIT 1);

UPDATE matches SET match_number = 7 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Estados Unidos' AND a.name = 'Bosnia y Herzegovina' LIMIT 1);

UPDATE matches SET match_number = 8 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Bélgica' AND a.name = 'Senegal' LIMIT 1);

UPDATE matches SET match_number = 9 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Brasil' AND a.name = 'Japón' LIMIT 1);

UPDATE matches SET match_number = 10 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Costa de Marfil' AND a.name = 'Noruega' LIMIT 1);

UPDATE matches SET match_number = 11 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'México' AND a.name = 'Ecuador' LIMIT 1);

UPDATE matches SET match_number = 12 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Inglaterra' AND a.name = 'R. D. del Congo' LIMIT 1);

UPDATE matches SET match_number = 13 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Argentina' AND a.name = 'Cabo Verde' LIMIT 1);

UPDATE matches SET match_number = 14 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Australia' AND a.name = 'Egipto' LIMIT 1);

UPDATE matches SET match_number = 15 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Suiza' AND a.name = 'Argelia' LIMIT 1);

UPDATE matches SET match_number = 16 WHERE id = (
  SELECT m.id FROM matches m
  JOIN teams h ON m.home_team_id = h.id
  JOIN teams a ON m.away_team_id = a.id
  WHERE h.name = 'Colombia' AND a.name = 'Ghana' LIMIT 1);

-- ── OCTAVOS DE FINAL (ROUND_OF_16, partidos 17-24) ─────────

-- 17: Ganador 1 vs Ganador 2 — Sábado 04/07 18:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 17, TIMESTAMP '2026-07-04 18:00:00');

-- 18: Ganador 3 vs Ganador 4 — Sábado 04/07 14:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 18, TIMESTAMP '2026-07-04 14:00:00');

-- 19: Ganador 5 vs Ganador 6 — Lunes 06/07 16:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 19, TIMESTAMP '2026-07-06 16:00:00');

-- 20: Ganador 7 vs Ganador 8 — Lunes 06/07 21:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 20, TIMESTAMP '2026-07-06 21:00:00');

-- 21: Ganador 9 vs Ganador 10 — Domingo 05/07 17:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 21, TIMESTAMP '2026-07-05 17:00:00');

-- 22: Ganador 11 vs Ganador 12 — Domingo 05/07 21:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 22, TIMESTAMP '2026-07-05 21:00:00');

-- 23: Ganador 13 vs Ganador 14 — Martes 07/07 13:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 23, TIMESTAMP '2026-07-07 13:00:00');

-- 24: Ganador 15 vs Ganador 16 — Martes 07/07 17:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'ROUND_OF_16', 'SCHEDULED', 24, TIMESTAMP '2026-07-07 17:00:00');

-- ── CUARTOS DE FINAL (QUARTER_FINAL, partidos 25-28) ───────

-- 25: Ganador 17 vs Ganador 18 — Jueves 09/07 17:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'QUARTER_FINAL', 'SCHEDULED', 25, TIMESTAMP '2026-07-09 17:00:00');

-- 26: Ganador 19 vs Ganador 20 — Viernes 10/07 16:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'QUARTER_FINAL', 'SCHEDULED', 26, TIMESTAMP '2026-07-10 16:00:00');

-- 27: Ganador 21 vs Ganador 22 — Sábado 11/07 18:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'QUARTER_FINAL', 'SCHEDULED', 27, TIMESTAMP '2026-07-11 18:00:00');

-- 28: Ganador 23 vs Ganador 24 — Sábado 11/07 22:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'QUARTER_FINAL', 'SCHEDULED', 28, TIMESTAMP '2026-07-11 22:00:00');

-- ── SEMIFINALES (SEMI_FINAL, partidos 29-30) ───────────────

-- 29: Ganador 25 vs Ganador 26 — Martes 14/07 16:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'SEMI_FINAL', 'SCHEDULED', 29, TIMESTAMP '2026-07-14 16:00:00');

-- 30: Ganador 27 vs Ganador 28 — Miércoles 15/07 16:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'SEMI_FINAL', 'SCHEDULED', 30, TIMESTAMP '2026-07-15 16:00:00');

-- ── TERCER PUESTO (THIRD_PLACE, partido 31) ────────────────

-- 31: Perdedor 29 vs Perdedor 30 — Sábado 18/07 18:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'THIRD_PLACE', 'SCHEDULED', 31, TIMESTAMP '2026-07-18 18:00:00');

-- ── FINAL (partido 32) ─────────────────────────────────────

-- 32: Ganador 29 vs Ganador 30 — Domingo 19/07 16:00 hs Argentina
INSERT INTO matches (id, stage, status, match_number, date_time)
VALUES (gen_random_uuid(), 'FINAL', 'SCHEDULED', 32, TIMESTAMP '2026-07-19 16:00:00');
