package com.prode.worldcup.domain.dtos.request;

public record ChampionPredictionRequestDTO(
        String champion,
        String championFlag,
        String runnerUp,
        String runnerUpFlag,
        String third,
        String thirdFlag,
        String fourth,
        String fourthFlag
) {}
