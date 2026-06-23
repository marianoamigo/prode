package com.prode.worldcup.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "group_predictions",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "user_id",
                                "group_id",
                                "team_id"
                        }
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupPredictionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    UserEntity user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    GroupEntity group;

    @ManyToOne
    @JoinColumn(name = "team_id")
    TeamEntity team;

    Integer position;

    @Builder.Default
    Integer pointsScored = 0;

    @Column(name = "is_late")
    @Builder.Default
    Boolean isLate = false;

}
