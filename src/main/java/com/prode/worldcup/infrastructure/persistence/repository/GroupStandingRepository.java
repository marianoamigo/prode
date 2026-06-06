package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.GroupStandingEntity;
import org.hibernate.boot.jaxb.mapping.spi.JaxbPersistentAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupStandingRepository extends JpaRepository<GroupStandingEntity, UUID> {
    List<GroupStandingEntity> findByGroupIdOrderByPosition(UUID groupId);

    Optional<GroupStandingEntity> findByGroupIdAndTeamId(UUID groupId,UUID teamId);

    void deleteByGroupId(UUID groupId);

}
