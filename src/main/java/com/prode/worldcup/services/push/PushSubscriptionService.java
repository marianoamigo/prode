package com.prode.worldcup.services.push;

import com.prode.worldcup.domain.dtos.request.PushSubscriptionRequestDTO;
import com.prode.worldcup.infrastructure.persistence.entity.PushSubscriptionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.PushSubscriptionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

    private final PushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void subscribe(String googleId, PushSubscriptionRequestDTO dto) {
        UserEntity user = userRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        subscriptionRepository.findByEndpoint(dto.endpoint()).ifPresentOrElse(
                existing -> {
                    existing.setP256dh(dto.p256dh());
                    existing.setAuth(dto.auth());
                    existing.setUser(user);
                    subscriptionRepository.save(existing);
                },
                () -> subscriptionRepository.save(
                        PushSubscriptionEntity.builder()
                                .user(user)
                                .endpoint(dto.endpoint())
                                .p256dh(dto.p256dh())
                                .auth(dto.auth())
                                .createdAt(LocalDateTime.now())
                                .build()
                )
        );
        log.info("Push subscription saved for user {}", user.getEmail());
    }

    @Transactional
    public void unsubscribe(String endpoint) {
        subscriptionRepository.deleteByEndpoint(endpoint);
        log.info("Push subscription removed: {}", endpoint);
    }
}
