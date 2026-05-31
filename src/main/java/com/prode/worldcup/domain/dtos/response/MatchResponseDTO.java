package com.prode.worldcup.domain.dtos.response;

import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;

import java.util.UUID;

public record MatchResponseDTO(
        UUID id,
        String homeTeam,
        String awayTeam,
        Integer homeScore,
        Integer awayScore,
        MatchStatus status,
        MatchStage stage
) {
}
