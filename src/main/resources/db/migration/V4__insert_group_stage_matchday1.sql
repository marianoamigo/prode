-- FECHA 1

-- Grupo A
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-11 16:00:00'
FROM teams h,teams a
WHERE h.name='México' AND a.name='Sudáfrica';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-11 23:00:00'
FROM teams h,teams a
WHERE h.name='Corea del Sur' AND a.name='República Checa';

-- Grupo B
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-12 16:00:00'
FROM teams h,teams a
WHERE h.name='Canadá' AND a.name='Bosnia y Herzegovina';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-13 16:00:00'
FROM teams h,teams a
WHERE h.name='Catar' AND a.name='Suiza';

-- Grupo C
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-13 19:00:00'
FROM teams h,teams a
WHERE h.name='Brasil' AND a.name='Marruecos';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-13 22:00:00'
FROM teams h,teams a
WHERE h.name='Haití' AND a.name='Escocia';

-- Grupo D
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-12 22:00:00'
FROM teams h,teams a
WHERE h.name='Estados Unidos' AND a.name='Paraguay';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-14 01:00:00'
FROM teams h,teams a
WHERE h.name='Australia' AND a.name='Turquía';

-- Grupo E
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-14 14:00:00'
FROM teams h,teams a
WHERE h.name='Alemania' AND a.name='Curazao';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-14 20:00:00'
FROM teams h,teams a
WHERE h.name='Costa de Marfil' AND a.name='Ecuador';

-- Grupo F
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-14 17:00:00'
FROM teams h,teams a
WHERE h.name='Países Bajos' AND a.name='Japón';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-14 23:00:00'
FROM teams h,teams a
WHERE h.name='Suecia' AND a.name='Túnez';

-- Grupo G
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-15 16:00:00'
FROM teams h,teams a
WHERE h.name='Bélgica' AND a.name='Egipto';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-15 22:00:00'
FROM teams h,teams a
WHERE h.name='Irán' AND a.name='Nueva Zelanda';

-- Grupo H
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-15 13:00:00'
FROM teams h,teams a
WHERE h.name='España' AND a.name='Cabo Verde';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-15 19:00:00'
FROM teams h,teams a
WHERE h.name='Arabia Saudita' AND a.name='Uruguay';

-- Grupo I
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-16 16:00:00'
FROM teams h,teams a
WHERE h.name='Francia' AND a.name='Senegal';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-16 19:00:00'
FROM teams h,teams a
WHERE h.name='Irak' AND a.name='Noruega';

-- Grupo J
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-16 22:00:00'
FROM teams h,teams a
WHERE h.name='Argentina' AND a.name='Argelia';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-17 01:00:00'
FROM teams h,teams a
WHERE h.name='Austria' AND a.name='Jordania';

-- Grupo K
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-17 14:00:00'
FROM teams h,teams a
WHERE h.name='Portugal' AND a.name='R. D. del Congo';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-17 23:00:00'
FROM teams h,teams a
WHERE h.name='Uzbekistán' AND a.name='Colombia';

-- Grupo L
INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-17 17:00:00'
FROM teams h,teams a
WHERE h.name='Inglaterra' AND a.name='Croacia';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-17 20:00:00'
FROM teams h,teams a
WHERE h.name='Ghana' AND a.name='Panamá';