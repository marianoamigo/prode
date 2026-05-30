package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.GroupEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, UUID> {
    Optional<GroupEntity> findByName(String name);
}
