package com.prode.worldcup.domain.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TeamModel {
    private String id; //UUID
    private String code;
    private String name;
    private String flagUrl;
    private String group;
}
