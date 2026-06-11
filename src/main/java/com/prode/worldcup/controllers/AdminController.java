package com.prode.worldcup.controllers;

import com.prode.worldcup.services.sync.LiveScoreSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final LiveScoreSyncService syncService;

    @PostMapping("/sync-scores")
    public ResponseEntity<String> syncScores() {
        syncService.syncScores();
        return ResponseEntity.ok("Sync ejecutado — revisá los logs");
    }
}
