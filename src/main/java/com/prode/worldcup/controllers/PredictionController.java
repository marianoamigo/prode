package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.PredictionRequestDTO;
import com.prode.worldcup.services.matches.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping(value = "/allmatches")
    public ResponseEntity<?> getAllMatches (/* params */) {
        return ResponseEntity.ok("Partidos");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @AuthenticationPrincipal OidcUser user,
            @RequestBody PredictionRequestDTO request
    ){
        predictionService.saveOrUpdatePrediction(
                user.getSubject(),
                request
        );

        return ResponseEntity.ok().build();
    }


}
