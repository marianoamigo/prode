package com.prode.worldcup.domain.dtos.response;

public record GlobalRankingResponseDTO(
        String userId,
        String userName,
        Integer totalPoints,
        String pictureUrl
) {
}