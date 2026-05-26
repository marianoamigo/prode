package com.prode.worldcup.domain.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MatchModel {
    private String id; //UUID
    private String homeId;
    private String awayId;
    private String stage; //ver
    private /*Status*/ String status; //ENUM
    private Integer homeScore;
    private Integer awayScore;
    private LocalDateTime dateTime;
}
