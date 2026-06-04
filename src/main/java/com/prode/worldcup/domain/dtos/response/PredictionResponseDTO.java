package com.prode.worldcup.domain.dtos.response;

import java.util.UUID;

public record PredictionResponseDTO(
        UUID id,
        UUID matchId,
        String homeTeam,
        String awayTeam,
        Integer predictedHomeScore,
        Integer predictedAwayScore,
        Integer pointsScored
) {
}
