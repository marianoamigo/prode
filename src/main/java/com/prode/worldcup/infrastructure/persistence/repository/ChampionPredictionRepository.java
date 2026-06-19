package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.ChampionPredictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChampionPredictionRepository extends JpaRepository<ChampionPredictionEntity, UUID> {
    Optional<ChampionPredictionEntity> findByUserId(UUID userId);
}
