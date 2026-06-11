package com.prode.worldcup.infrastructure.persistence.repository;

import com.prode.worldcup.infrastructure.persistence.entity.PushSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscriptionEntity, UUID> {

    Optional<PushSubscriptionEntity> findByEndpoint(String endpoint);

    @Transactional
    @Modifying
    @Query("DELETE FROM PushSubscriptionEntity p WHERE p.endpoint = :endpoint")
    void deleteByEndpoint(String endpoint);
}
