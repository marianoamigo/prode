package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.response.GroupPredictionResponseDTO;
import com.prode.worldcup.domain.dtos.response.ProfileResponseDTO;
import com.prode.worldcup.services.group.GroupPredictionService;
import com.prode.worldcup.services.profile.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final GroupPredictionService groupPredictionService;

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDTO> getProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @GetMapping("/{userId}/group-predictions/{groupId}")
    public List<GroupPredictionResponseDTO> getGroupPredictions(
            @PathVariable UUID userId,
            @PathVariable UUID groupId
    ) {
        return groupPredictionService.findByUserIdAndGroupId(userId, groupId);
    }
}