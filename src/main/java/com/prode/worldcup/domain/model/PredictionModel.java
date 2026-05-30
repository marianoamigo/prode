package com.prode.worldcup.domain.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PredictionModel {
    private UUID id; //UUID
    private UserModel user;
    private MatchModel match;
    private Integer predictionHomeScore;
    private Integer predictionAwayScore;
    private Integer pointsScored;
    private LocalDateTime createdAt;
}
