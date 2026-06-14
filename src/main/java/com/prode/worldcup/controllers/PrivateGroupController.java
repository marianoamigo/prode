package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.PrivateGroupRequestDTO;
import com.prode.worldcup.domain.dtos.response.PrivateGroupResponseDTO;
import com.prode.worldcup.services.group.PrivateGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/private")
public class PrivateGroupController {

    private final PrivateGroupService privateGroupService;

    @PostMapping("/create")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal OidcUser user,
            @RequestBody PrivateGroupRequestDTO request
    ) {
        try {
            PrivateGroupResponseDTO response = privateGroupService.createGroup(user.getSubject(), request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<?> join(
            @AuthenticationPrincipal OidcUser user,
            @PathVariable String inviteCode
    ) {
        privateGroupService.joinGroup(user.getSubject(), inviteCode);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leave(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal OidcUser user
    ) {
        try {
            privateGroupService.leaveGroup(groupId, user.getSubject());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-groups")
    public ResponseEntity<?> myGroups(@AuthenticationPrincipal OidcUser user) {
        return ResponseEntity.ok(privateGroupService.getMyGroups(user.getSubject()));
    }

    @GetMapping("/{groupId}/ranking")
    public ResponseEntity<?> ranking(@PathVariable UUID groupId) {
        return ResponseEntity.ok(privateGroupService.getGroupRanking(groupId));
    }

    @GetMapping("/{groupId}/live-match/{matchId}")
    public ResponseEntity<?> liveMatchDetails(
            @PathVariable UUID groupId,
            @PathVariable UUID matchId
    ) {
        return ResponseEntity.ok(privateGroupService.getLiveMatchGroupDetails(groupId, matchId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal OidcUser user
    ) {
        return ResponseEntity.ok(privateGroupService.getGroup(groupId, user.getSubject()));
    }

    @GetMapping("/invite/{inviteCode}")
    public ResponseEntity<?> getGroupByInviteCode(@PathVariable String inviteCode) {
        try {
            return ResponseEntity.ok(privateGroupService.getGroupByInviteCode(inviteCode));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> delete(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal OidcUser user
    ) {
        privateGroupService.deleteGroup(groupId, user.getSubject());
        return ResponseEntity.noContent().build();
    }
}