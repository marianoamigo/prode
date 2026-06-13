package com.prode.worldcup.domain.dtos.external;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalGame(
        @JsonProperty("id") String id,
        @JsonProperty("home_team_id") String homeTeamId,
        @JsonProperty("away_team_id") String awayTeamId,
        @JsonProperty("home_score") String homeScore,
        @JsonProperty("away_score") String awayScore,
        @JsonProperty("finished") String finished,
        @JsonProperty("time_elapsed") String timeElapsed,
        @JsonProperty("type") String type,
        @JsonProperty("home_team_name_en") String homeTeamNameEn,
        @JsonProperty("away_team_name_en") String awayTeamNameEn
) {
    public boolean isFinished() {
        return "TRUE".equalsIgnoreCase(finished);
    }

    public boolean isLive() {
        return !isFinished()
                && timeElapsed != null
                && !timeElapsed.isBlank()
                && !"notstarted".equalsIgnoreCase(timeElapsed);
    }

    public boolean isGroupStage() {
        return "group".equalsIgnoreCase(type);
    }

    public boolean hasKnownTeams() {
        return homeTeamId != null && !"0".equals(homeTeamId)
                && awayTeamId != null && !"0".equals(awayTeamId);
    }
}
