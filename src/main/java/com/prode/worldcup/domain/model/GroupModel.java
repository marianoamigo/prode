package com.prode.worldcup.domain.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GroupModel {
    String id;
    String name;
    List<TeamModel> teams;
}
