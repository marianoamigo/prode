package com.prode.worldcup.domain.dtos.request;

public record PushSubscriptionRequestDTO(
        String endpoint,
        String p256dh,
        String auth
) {}
