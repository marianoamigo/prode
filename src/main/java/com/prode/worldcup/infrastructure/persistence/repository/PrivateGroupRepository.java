package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.PrivateGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrivateGroupRepository extends JpaRepository<PrivateGroupEntity, UUID> {

    Optional<PrivateGroupEntity> findByInviteCode(String inviteCode);

    boolean existsByName(String name);

}
