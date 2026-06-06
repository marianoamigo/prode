package com.prode.worldcup.domain.model;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GroupStandingModel {
    private UUID id;

    private GroupModel group;

    private TeamModel team;

    private Integer played;
    private Integer wins;
    private Integer draws;
    private Integer losses;

    private Integer goalsFor;
    private Integer goalsAgainst;
    private Integer goalDifference;

    private Integer points;

    private Integer position;
}
