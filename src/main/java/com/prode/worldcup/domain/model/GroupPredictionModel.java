package com.prode.worldcup.domain.model;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GroupPredictionModel {
    private UUID id;

    private UserModel user;

    private GroupModel group;

    private TeamModel team;

    private Integer position;
}
