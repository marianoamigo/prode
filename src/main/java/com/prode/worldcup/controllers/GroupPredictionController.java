package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.GroupPredictionSaveAllRequestDTO;
import com.prode.worldcup.domain.dtos.request.GroupPredictionSaveRequestDTO;
import com.prode.worldcup.domain.dtos.response.GroupPredictionResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.GroupPredictionEntity;
import com.prode.worldcup.services.group.GroupPredictionService;
import com.prode.worldcup.services.oauth.CustomOidcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group-predictions")
public class GroupPredictionController {
    private final GroupPredictionService groupPredictionService;
    @PostMapping("/save")
    public ResponseEntity<Void>
    savePrediction(
            @AuthenticationPrincipal
            OidcUser user,

            @RequestBody
            GroupPredictionSaveRequestDTO request
    ){
        groupPredictionService
                .savePrediction(
                        user.getSubject(),
                        request
                );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/save-all")
    public ResponseEntity<Void>
    saveAllPredictions(

            @AuthenticationPrincipal
            OidcUser user,

            @RequestBody
            GroupPredictionSaveAllRequestDTO request
    ){
        groupPredictionService
                .saveAllPredictions(
                        user.getSubject(),
                        request
                );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{groupId}")
    public List<GroupPredictionResponseDTO>
    findPrediction(@AuthenticationPrincipal
                   OidcUser user,
                   @PathVariable UUID groupId) {
        return groupPredictionService
                        .findByGroupId(
                                user.getSubject(),
                                groupId
                        );
    }
}
