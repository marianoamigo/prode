package com.prode.worldcup.domain.dtos.response;

import java.util.UUID;

public record PrivateGroupResponseDTO(
        UUID id,
        String name,
        String inviteCode,
        String inviteLink
) {
}
