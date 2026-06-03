package com.prode.worldcup.domain.dtos.request;

import java.util.UUID;

public record MatchResultRequestDTO (
        UUID matchId,
        Integer homeScore,
        Integer awayScore
){}
