CREATE TABLE IF NOT EXISTS champion_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    champion VARCHAR(100),
    champion_flag VARCHAR(255),
    runner_up VARCHAR(100),
    runner_up_flag VARCHAR(255),
    third VARCHAR(100),
    third_flag VARCHAR(255),
    fourth VARCHAR(100),
    fourth_flag VARCHAR(255),
    updated_at TIMESTAMP
);