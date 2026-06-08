package com.prode.worldcup.domain.dtos.request;


import java.util.List;

public record GroupPredictionSaveAllRequestDTO (
        List<GroupPredictionSaveRequestDTO> groups
) {
}
