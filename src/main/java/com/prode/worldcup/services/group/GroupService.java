package com.prode.worldcup.services.group;

import com.prode.worldcup.domain.dtos.response.GroupResponseDTO;
import com.prode.worldcup.domain.dtos.response.TeamResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.GroupEntity;
import com.prode.worldcup.infrastructure.persistence.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor

public class GroupService {
    private final GroupRepository groupRepository;

    public List<GroupResponseDTO> findAll() {

        return groupRepository
                .findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public GroupResponseDTO findById(
            UUID id
    ) {

        GroupEntity group =
                groupRepository
                        .findById(id)
                        .orElseThrow();

        return toDto(group);
    }

    private GroupResponseDTO toDto(
            GroupEntity group
    ) {

        return new GroupResponseDTO(

                group.getId(),

                group.getName(),

                group.getTeams()
                        .stream()
                        .map(team ->

                                new TeamResponseDTO(

                                        team.getId(),

                                        team.getName(),

                                        team.getCode()
                                )
                        )
                        .toList()
        );
    }

}
