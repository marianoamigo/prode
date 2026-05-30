package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository

public interface PredictionRepository extends JpaRepository<PredictionEntity, UUID> {
    Optional<PredictionEntity>
    findByUserIdAndMatchId(UUID userId, UUID matchId);

    List<PredictionEntity>
    findByUserId(UUID userId);

    List<PredictionEntity>
    findByMatchId(UUID matchId);
}
