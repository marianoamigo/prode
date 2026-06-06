package com.prode.worldcup.domain.dtos.request;

import java.util.List;
import java.util.UUID;

public record GroupPredictionSaveRequestDTO(

        UUID groupId,

        List<GroupPredictionRequestDTO>
                predictions

) {
}