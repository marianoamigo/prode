package com.prode.worldcup.domain.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PredictionModel {
    private String id; //UUID
    private UserModel user;
    private MatchModel match;
    private Integer predictionHomeScore;
    private Integer predictionAwayScore;
    private Integer pointsScored;
    private LocalDateTime createdAt;
}
