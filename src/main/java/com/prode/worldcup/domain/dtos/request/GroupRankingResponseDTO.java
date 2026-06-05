package com.prode.worldcup.domain.dtos.request;

import java.util.UUID;

public record GroupRankingResponseDTO(
        UUID userId,
        String userName,
        Integer totalPoints
) {
}
