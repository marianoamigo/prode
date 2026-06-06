package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.response.GroupStandingResponseDTO;
import com.prode.worldcup.services.group.GroupStandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group-standings")
public class GroupStandingController {

    private final GroupStandingService
            groupStandingService;

    @GetMapping("/{groupId}")
    public List<GroupStandingResponseDTO>
    findByGroupId(
            @PathVariable UUID groupId
    ) {

        return groupStandingService
                .findByGroupId(
                        groupId
                );
    }
}