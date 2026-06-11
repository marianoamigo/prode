package com.prode.worldcup.services.sync;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LiveScoreSyncScheduler {

    private final LiveScoreSyncService syncService;

    // Every 3 minutes — generous rate limit (500 req/min on their end)
    @Scheduled(fixedDelay = 3 * 60 * 1000)
    public void sync() {
        syncService.syncScores();
    }
}
