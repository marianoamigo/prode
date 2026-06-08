package com.prode.worldcup.domain.dtos.response;

public record  GroupStandingResponseDTO(

        String groupName,
        Integer position,

        String teamName,

        String flagUrl,

        Integer played,

        Integer wins,

        Integer draws,

        Integer losses,

        Integer goalsFor,

        Integer goalsAgainst,

        Integer goalDifference,

        Integer points
){
}
