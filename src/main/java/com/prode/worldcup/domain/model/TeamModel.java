package com.prode.worldcup.domain.model;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TeamModel {
    private UUID id; //UUID
    private String code;
    private String name;
    private String group;
}
