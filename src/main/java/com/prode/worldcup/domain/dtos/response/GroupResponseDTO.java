package com.prode.worldcup.domain.dtos.response;

import java.util.List;
import java.util.UUID;

public record GroupResponseDTO (
        UUID id,

        String name,

        List<TeamResponseDTO> teams
) {
}
