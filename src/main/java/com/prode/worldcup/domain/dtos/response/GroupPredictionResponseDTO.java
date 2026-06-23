package com.prode.worldcup.domain.dtos.response;

import java.util.UUID;

public record GroupPredictionResponseDTO (
        UUID teamId,
        Integer position,
        Boolean isLate
) {
}
