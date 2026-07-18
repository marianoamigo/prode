package com.prode.worldcup.domain.dtos.response;

public record ChampionTableRowResponseDTO(
        int position,
        String teamName,
        String teamFlagUrl,
        String actualTeamName,
        String actualTeamFlagUrl,
        Integer points
) {}
