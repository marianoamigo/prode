package com.prode.worldcup.controllers;

import com.prode.worldcup.infrastructure.persistence.repository.GroupRepository;
import com.prode.worldcup.services.group.GroupPredictionService;
import com.prode.worldcup.services.matches.MatchService;
import com.prode.worldcup.services.sync.LiveScoreSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final LiveScoreSyncService syncService;
    private final MatchService matchService;
    private final GroupPredictionService groupPredictionService;
    private final GroupRepository groupRepository;

    @PostMapping("/sync-scores")
    public ResponseEntity<String> syncScores() {
        syncService.syncScores();
        return ResponseEntity.ok("Sync ejecutado — revisá los logs");
    }

    @PostMapping("/recalculate/{matchId}")
    public ResponseEntity<String> recalculate(@PathVariable UUID matchId) {
        matchService.recalculateMatch(matchId);
        return ResponseEntity.ok("Recálculo ejecutado");
    }

    @PostMapping("/reset/{matchId}")
    public ResponseEntity<String> resetMatch(@PathVariable UUID matchId) {
        matchService.resetMatch(matchId);
        return ResponseEntity.ok("Partido reseteado a SCHEDULED, scores limpiados, puntos a cero");
    }

    @PostMapping("/recalculate-group/{groupName}")
    public ResponseEntity<String> forceRecalculateGroup(@PathVariable String groupName) {
        return groupRepository.findByName(groupName.toUpperCase())
                .map(group -> {
                    groupPredictionService.forceRecalculatePoints(group.getId());
                    return ResponseEntity.ok("Recálculo forzado del grupo " + groupName.toUpperCase() + " ejecutado");
                })
                .orElse(ResponseEntity.badRequest().body("Grupo no encontrado: " + groupName));
    }

    @PostMapping("/recalculate-all-groups")
    public ResponseEntity<String> forceRecalculateAllGroups() {
        groupRepository.findAll().forEach(group ->
                groupPredictionService.forceRecalculatePoints(group.getId())
        );
        return ResponseEntity.ok("Recálculo forzado de todos los grupos ejecutado");
    }

    @PostMapping("/recalculate-everything")
    public ResponseEntity<String> recalculateEverything() {
        matchService.recalculateAllFinishedMatches();
        groupRepository.findAll().forEach(group ->
                groupPredictionService.forceRecalculatePoints(group.getId())
        );
        return ResponseEntity.ok("Recálculo completo ejecutado: partidos + grupos");
    }
}
