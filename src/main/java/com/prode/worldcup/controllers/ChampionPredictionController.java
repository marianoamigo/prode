package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.ChampionPredictionRequestDTO;
import com.prode.worldcup.services.champion.ChampionPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/champion-prediction")
public class ChampionPredictionController {

    private final ChampionPredictionService service;

    @GetMapping("/mine")
    public ResponseEntity<?> mine(@AuthenticationPrincipal OidcUser user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getMineByGoogleId(user.getSubject()));
    }

    @PostMapping("/save")
    public ResponseEntity<?> save(
            @AuthenticationPrincipal OidcUser user,
            @RequestBody ChampionPredictionRequestDTO request
    ) {
        if (user == null) return ResponseEntity.status(401).build();
        service.save(user.getSubject(), request);
        return ResponseEntity.ok().build();
    }
}
