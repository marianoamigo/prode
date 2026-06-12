package com.prode.worldcup.domain.dtos.response;

import java.time.LocalDateTime;

public record ProfilePredictionDTO(
        String homeTeam,
        String homeFlagUrl,
        String awayTeam,
        String awayFlagUrl,
        int homeScore,
        int awayScore,
        int predictedHomeScore,
        int predictedAwayScore,
        int pointsScored,
        LocalDateTime matchDateTime,
        String stage,
        String groupName
) {
}