package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.GroupPredictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupPredictionRepository extends JpaRepository<GroupPredictionEntity, UUID> {
    List<GroupPredictionEntity>
    findByUserIdAndGroupId(
            UUID userId,
            UUID groupId
    );

    void deleteByUserIdAndGroupId(
            UUID userId,
            UUID groupId
    );

    List<GroupPredictionEntity>
    findByGroupId(
            UUID groupId
    );

    boolean existsByUserIdAndGroupId(UUID userId, UUID groupId);

    @Query("SELECT DISTINCT gp.group.id FROM GroupPredictionEntity gp WHERE gp.user.id = :userId")
    List<UUID> findGroupIdsByUserId(@Param("userId") UUID userId);
}
