package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.PredictionRequestDTO;
import com.prode.worldcup.domain.dtos.response.PredictionResponseDTO;
import com.prode.worldcup.services.matches.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;

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

    @GetMapping("/mine")
    public ResponseEntity<?> mine(@AuthenticationPrincipal OidcUser user) {
        List<PredictionResponseDTO> predictions = predictionService.getMyPredictions(user.getSubject());
        return ResponseEntity.ok(predictions);
    }


}
