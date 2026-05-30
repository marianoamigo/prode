package com.prode.worldcup.domain.dtos.request;

import java.util.UUID;

public record PredictionRequestDTO(

        UUID matchId,
        Integer homeScore,
        Integer awayScore
) {
}
