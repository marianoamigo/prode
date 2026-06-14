package com.prode.worldcup.domain.dtos.response;

public record LiveMatchGroupMemberDTO(
        String userName,
        Integer predictedHomeScore,
        Integer predictedAwayScore,
        Integer livePoints
) {}