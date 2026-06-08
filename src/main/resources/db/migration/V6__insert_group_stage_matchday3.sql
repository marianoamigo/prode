-- GRUPO A

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-24 22:00:00'
FROM teams h,teams a
WHERE h.name='República Checa' AND a.name='México';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-24 22:00:00'
FROM teams h,teams a
WHERE h.name='Sudáfrica' AND a.name='Corea del Sur';

-- GRUPO B

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-24 16:00:00'
FROM teams h,teams a
WHERE h.name='Suiza' AND a.name='Canadá';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-24 16:00:00'
FROM teams h,teams a
WHERE h.name='Bosnia y Herzegovina' AND a.name='Catar';

-- GRUPO C

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-24 19:00:00'
FROM teams h,teams a
WHERE h.name='Escocia' AND a.name='Brasil';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-24 19:00:00'
FROM teams h,teams a
WHERE h.name='Marruecos' AND a.name='Haití';

-- GRUPO D

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-25 23:00:00'
FROM teams h,teams a
WHERE h.name='Paraguay' AND a.name='Australia';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-25 23:00:00'
FROM teams h,teams a
WHERE h.name='Turquía' AND a.name='Estados Unidos';

-- GRUPO E

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-25 17:00:00'
FROM teams h,teams a
WHERE h.name='Ecuador' AND a.name='Alemania';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-25 17:00:00'
FROM teams h,teams a
WHERE h.name='Curazao' AND a.name='Costa de Marfil';

-- GRUPO F

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-25 20:00:00'
FROM teams h,teams a
WHERE h.name='Túnez' AND a.name='Países Bajos';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-25 20:00:00'
FROM teams h,teams a
WHERE h.name='Japón' AND a.name='Suecia';

-- GRUPO G

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 00:00:00'
FROM teams h,teams a
WHERE h.name='Egipto' AND a.name='Irán';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 00:00:00'
FROM teams h,teams a
WHERE h.name='Nueva Zelanda' AND a.name='Bélgica';


-- GRUPO H

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-26 21:00:00'
FROM teams h,teams a
WHERE h.name='Cabo Verde' AND a.name='Arabia Saudita';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-26 21:00:00'
FROM teams h,teams a
WHERE h.name='Uruguay' AND a.name='España';


-- GRUPO I

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-26 16:00:00'
FROM teams h,teams a
WHERE h.name='Noruega' AND a.name='Francia';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-26 16:00:00'
FROM teams h,teams a
WHERE h.name='Senegal' AND a.name='Irak';


-- GRUPO J

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 23:00:00'
FROM teams h,teams a
WHERE h.name='Argelia' AND a.name='Austria';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 23:00:00'
FROM teams h,teams a
WHERE h.name='Jordania' AND a.name='Argentina';


-- GRUPO K

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 20:30:00'
FROM teams h,teams a
WHERE h.name='Colombia' AND a.name='Portugal';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 20:30:00'
FROM teams h,teams a
WHERE h.name='R. D. del Congo' AND a.name='Uzbekistán';


-- GRUPO L

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 18:00:00'
FROM teams h,teams a
WHERE h.name='Croacia' AND a.name='Ghana';

INSERT INTO matches(id,home_team_id,away_team_id,stage,status,date_time)
SELECT gen_random_uuid(),h.id,a.id,'GROUP_STAGE','SCHEDULED',TIMESTAMP '2026-06-27 18:00:00'
FROM teams h,teams a
WHERE h.name='Panamá' AND a.name='Inglaterra';