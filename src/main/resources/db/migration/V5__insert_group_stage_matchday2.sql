-- GRUPO A

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-18 13:00:00'
FROM teams h,teams a
WHERE h.name='República Checa' AND a.name='Sudáfrica';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-18 22:00:00'
FROM teams h,teams a
WHERE h.name='México' AND a.name='Corea del Sur';

-- GRUPO B

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-18 16:00:00'
FROM teams h,teams a
WHERE h.name='Suiza' AND a.name='Bosnia y Herzegovina';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-18 19:00:00'
FROM teams h,teams a
WHERE h.name='Canadá' AND a.name='Catar';

-- GRUPO C

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-19 19:00:00'
FROM teams h,teams a
WHERE h.name='Escocia' AND a.name='Marruecos';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-19 21:30:00'
FROM teams h,teams a
WHERE h.name='Brasil' AND a.name='Haití';

-- GRUPO D

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-19 00:00:00'
FROM teams h,teams a
WHERE h.name='Turquía' AND a.name='Paraguay';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-19 16:00:00'
FROM teams h,teams a
WHERE h.name='Estados Unidos' AND a.name='Australia';

-- GRUPO E

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-20 17:00:00'
FROM teams h,teams a
WHERE h.name='Alemania' AND a.name='Costa de Marfil';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-20 21:00:00'
FROM teams h,teams a
WHERE h.name='Ecuador' AND a.name='Curazao';

-- GRUPO F

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-20 14:00:00'
FROM teams h,teams a
WHERE h.name='Países Bajos' AND a.name='Suecia';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-21 01:00:00'
FROM teams h,teams a
WHERE h.name='Túnez' AND a.name='Japón';

-- GRUPO G

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-21 16:00:00'
FROM teams h,teams a
WHERE h.name='Bélgica' AND a.name='Irán';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-21 22:00:00'
FROM teams h,teams a
WHERE h.name='Nueva Zelanda' AND a.name='Egipto';

-- GRUPO H

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-21 13:00:00'
FROM teams h,teams a
WHERE h.name='España' AND a.name='Arabia Saudita';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-21 19:00:00'
FROM teams h,teams a
WHERE h.name='Uruguay' AND a.name='Cabo Verde';

-- GRUPO I

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-22 18:00:00'
FROM teams h,teams a
WHERE h.name='Francia' AND a.name='Irak';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-22 21:00:00'
FROM teams h,teams a
WHERE h.name='Noruega' AND a.name='Senegal';

-- GRUPO J

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-22 14:00:00'
FROM teams h,teams a
WHERE h.name='Argentina' AND a.name='Austria';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-23 00:00:00'
FROM teams h,teams a
WHERE h.name='Jordania' AND a.name='Argelia';

-- GRUPO K

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-23 14:00:00'
FROM teams h,teams a
WHERE h.name='Portugal' AND a.name='Uzbekistán';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-23 23:00:00'
FROM teams h,teams a
WHERE h.name='Colombia' AND a.name='R. D. del Congo';

-- GRUPO L

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-23 17:00:00'
FROM teams h,teams a
WHERE h.name='Inglaterra' AND a.name='Ghana';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-23 20:00:00'
FROM teams h,teams a
WHERE h.name='Panamá' AND a.name='Croacia';