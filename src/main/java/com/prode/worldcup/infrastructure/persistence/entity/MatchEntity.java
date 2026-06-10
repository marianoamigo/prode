package com.prode.worldcup.infrastructure.persistence.entity;

import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; //UUID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id")
    private TeamEntity homeTeam;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id")
    private TeamEntity  awayTeam;
    @Enumerated(EnumType.STRING)
    private MatchStage stage; //GROUP_STAGE/ROUND_OF_32/ROUND_OF_16
    @Enumerated(EnumType.STRING)
    private MatchStatus status; //SCHEDULED, LIVE, FINISHED
    private Integer homeScore;
    private Integer awayScore;
    private LocalDateTime dateTime;
    private Integer matchDay;

    //antes del partido: status=SCHEDULED, home/away Score=null, durante partido: status=LIVE, post=FINISHED
}
