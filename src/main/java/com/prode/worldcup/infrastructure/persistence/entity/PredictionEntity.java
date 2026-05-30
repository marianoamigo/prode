package com.prode.worldcup.infrastructure.persistence.entity;

import com.prode.worldcup.domain.model.MatchModel;
import com.prode.worldcup.domain.model.UserModel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "predictions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_prediction_user_match",
                        columnNames = {"user_id", "match_id"}
                )
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; //UUID
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    @ManyToOne
    @JoinColumn(name = "match_id")
    private MatchEntity match;
    private Integer predictionHomeScore;
    private Integer predictionAwayScore;
    private Integer pointsScored;
    private LocalDateTime createdAt;
}
