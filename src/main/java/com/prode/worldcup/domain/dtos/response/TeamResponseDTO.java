package com.prode.worldcup.domain.dtos.response;

import java.util.UUID;

public record TeamResponseDTO (
        UUID id,

        String name,

        String code
) {
}
