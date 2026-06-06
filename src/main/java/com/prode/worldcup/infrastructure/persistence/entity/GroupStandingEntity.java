package com.prode.worldcup.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "group_standings",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"group_id","team_id"})})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupStandingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private GroupEntity group;

    @ManyToOne
    @JoinColumn(name = "team_id")
    TeamEntity team;

    Integer played;
    Integer wins;
    Integer draws;
    Integer losses;

    Integer goalsFor;
    Integer goalsAgainst;
    Integer goalDifference;

    Integer points;

    Integer position;
}
