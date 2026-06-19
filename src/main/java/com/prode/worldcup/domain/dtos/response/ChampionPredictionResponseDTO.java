package com.prode.worldcup.domain.dtos.response;

public record ChampionPredictionResponseDTO(
        String champion,
        String championFlag,
        String runnerUp,
        String runnerUpFlag,
        String third,
        String thirdFlag,
        String fourth,
        String fourthFlag
) {}
