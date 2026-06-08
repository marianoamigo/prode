CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    picture_url VARCHAR(1000)
);

CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    group_id UUID,
    CONSTRAINT fk_team_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id)
);

CREATE TABLE matches (
    id UUID PRIMARY KEY,
    home_team_id UUID,
    away_team_id UUID,
    stage VARCHAR(50),
    status VARCHAR(50),
    home_score INTEGER,
    away_score INTEGER,
    date_time TIMESTAMP,

    CONSTRAINT fk_match_home_team
        FOREIGN KEY (home_team_id)
        REFERENCES teams(id),

    CONSTRAINT fk_match_away_team
        FOREIGN KEY (away_team_id)
        REFERENCES teams(id)
);

CREATE TABLE predictions (
    id UUID PRIMARY KEY,
    user_id UUID,
    match_id UUID,
    prediction_home_score INTEGER,
    prediction_away_score INTEGER,
    points_scored INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,

    CONSTRAINT fk_prediction_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_prediction_match
        FOREIGN KEY (match_id)
        REFERENCES matches(id),

    CONSTRAINT uk_prediction_user_match
        UNIQUE(user_id, match_id)
);

CREATE TABLE private_groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(255) NOT NULL UNIQUE,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_private_group_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
);

CREATE TABLE private_group_users (
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,

    PRIMARY KEY(group_id, user_id),

    CONSTRAINT fk_pgu_group
        FOREIGN KEY (group_id)
        REFERENCES private_groups(id),

    CONSTRAINT fk_pgu_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE TABLE group_predictions (
    id UUID PRIMARY KEY,
    user_id UUID,
    group_id UUID,
    team_id UUID,
    position INTEGER,
    points_scored INTEGER DEFAULT 0,

    CONSTRAINT fk_gp_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_gp_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id),

    CONSTRAINT fk_gp_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id),

    CONSTRAINT uk_group_prediction
        UNIQUE(user_id, group_id, team_id)
);

CREATE TABLE group_standings (
    id UUID PRIMARY KEY,

    group_id UUID,
    team_id UUID,

    played INTEGER,
    wins INTEGER,
    draws INTEGER,
    losses INTEGER,

    goals_for INTEGER,
    goals_against INTEGER,
    goal_difference INTEGER,

    points INTEGER,
    position INTEGER,

    CONSTRAINT fk_gs_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id),

    CONSTRAINT fk_gs_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id),

    CONSTRAINT uk_group_standing
        UNIQUE(group_id, team_id)
);