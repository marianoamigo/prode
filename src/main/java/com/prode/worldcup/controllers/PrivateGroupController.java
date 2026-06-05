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
        PrivateGroupResponseDTO response = privateGroupService.createGroup(user.getSubject(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<?> join(
            @AuthenticationPrincipal OidcUser user,
            @PathVariable String inviteCode
    ) {
        privateGroupService.joinGroup(
                user.getSubject(),
                inviteCode
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-groups")
    public ResponseEntity<?> myGroups(
            @AuthenticationPrincipal
            OidcUser user
    ) {

        return ResponseEntity.ok(
                privateGroupService.getMyGroups(
                        user.getSubject()
                )
        );
    }

    @GetMapping("/{groupId}/ranking")
    public ResponseEntity<?> ranking(
            @PathVariable UUID groupId
    ) {

        return ResponseEntity.ok(
                privateGroupService
                        .getGroupRanking(
                                groupId
                        )
        );
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(
            @PathVariable UUID groupId
    ) {

        return ResponseEntity.ok(
                privateGroupService.getGroup(
                        groupId
                )
        );
    }
}
