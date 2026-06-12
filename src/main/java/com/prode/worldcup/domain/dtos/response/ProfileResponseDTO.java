package com.prode.worldcup.domain.dtos.response;

import java.util.List;

public record ProfileResponseDTO(
        String userName,
        String pictureUrl,
        int totalPoints,
        List<ProfilePredictionDTO> predictions
) {
}