package com.prode.worldcup.domain.dtos.response;

import java.util.UUID;

public record GroupRankingResponseDTO(
        UUID userId,
        String userName,
        Integer totalPoints,
        String pictureUrl
) {
}
