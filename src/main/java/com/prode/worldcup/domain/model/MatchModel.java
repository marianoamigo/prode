package com.prode.worldcup.domain.model;

import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MatchModel {
    private UUID id; //UUID
    private TeamModel homeTeam;
    private TeamModel awayTeam;
    private MatchStage stage; //GROUP_STAGE/ROUND_OF_32/ROUND_OF_16
    private MatchStatus status; //SCHEDULED, LIVE, FINISHED
    private Integer homeScore;
    private Integer awayScore;
    private LocalDateTime dateTime;
}
