package com.prode.worldcup.domain.model;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GroupModel {
    private UUID id;
    private String name;
    private List<TeamModel> teams;
}
