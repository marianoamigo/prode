package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.response.GroupResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.GroupEntity;
import com.prode.worldcup.services.group.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group")
public class GroupController {

    private final GroupService groupService;

    @GetMapping("/all")
    public List<GroupResponseDTO> findAll() {

        return groupService.findAll();
    }

    @GetMapping("/{id}")
    public GroupResponseDTO findById(
            @PathVariable UUID id
    ) {

        return groupService.findById(id);
    }
}

