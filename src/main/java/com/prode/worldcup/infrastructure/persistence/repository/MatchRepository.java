package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<MatchEntity, UUID> {

    Optional<MatchEntity>
    findByHomeTeamAndAwayTeam(TeamEntity homeTeam, TeamEntity awayTeam);

    List<MatchEntity> findByStatus(MatchStatus status);

    List<MatchEntity> findByStage(MatchStage stage);

    List<MatchEntity>
    findByStageAndStatus(MatchStage stage,MatchStatus status);
}
