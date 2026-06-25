package com.prode.worldcup.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "champion_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChampionPredictionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    private String champion;
    private String championFlag;
    private String runnerUp;
    private String runnerUpFlag;
    private String third;
    private String thirdFlag;
    private String fourth;
    private String fourthFlag;
    private LocalDateTime updatedAt;
    @Builder.Default
    private Integer pointsScored = 0;
}