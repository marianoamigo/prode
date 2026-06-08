INSERT INTO group_standings (
    id,
    group_id,
    team_id,
    played,
    wins,
    draws,
    losses,
    goals_for,
    goals_against,
    goal_difference,
    points,
    position
)
SELECT
    gen_random_uuid(),
    t.group_id,
    t.id,
    0, -- played
    0, -- wins
    0, -- draws
    0, -- losses
    0, -- goals_for
    0, -- goals_against
    0, -- goal_difference
    0, -- points
    0  -- position
FROM teams t;