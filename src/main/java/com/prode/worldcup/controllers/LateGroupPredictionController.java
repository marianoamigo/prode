package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.response.GroupResponseDTO;
import com.prode.worldcup.domain.dtos.response.TeamResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.GroupPredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.GroupRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/late-groups")
public class LateGroupPredictionController {

    private final GroupPredictionRepository groupPredictionRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    private static final Set<String> EXCLUDED_GROUPS = Set.of("B", "C");

    @GetMapping("/available")
    public ResponseEntity<List<GroupResponseDTO>> getAvailableGroups(
            @AuthenticationPrincipal OidcUser user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        UserEntity userEntity = userRepository.findByGoogleId(user.getSubject()).orElseThrow();
        List<UUID> predictedGroupIds = groupPredictionRepository.findGroupIdsByUserId(userEntity.getId());

        List<GroupResponseDTO> available = groupRepository.findAll().stream()
                .filter(g -> !EXCLUDED_GROUPS.contains(g.getName()))
                .filter(g -> !predictedGroupIds.contains(g.getId()))
                .map(g -> new GroupResponseDTO(
                        g.getId(),
                        g.getName(),
                        g.getTeams().stream()
                                .map(t -> new TeamResponseDTO(t.getId(), t.getName(), t.getCode()))
                                .toList()
                ))
                .sorted((a, b) -> a.name().compareTo(b.name()))
                .toList();

        return ResponseEntity.ok(available);
    }
}
