package com.prode.worldcup.services.group;

import com.prode.worldcup.domain.dtos.response.GroupRankingResponseDTO;
import com.prode.worldcup.domain.dtos.request.PrivateGroupRequestDTO;
import com.prode.worldcup.domain.dtos.response.PrivateGroupResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.PrivateGroupEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.PrivateGroupRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrivateGroupService {

    private final UserRepository userRepository;
    private final PrivateGroupRepository privateGroupRepository;
    private static final String JOIN_PATH = "/join/";

    public PrivateGroupResponseDTO createGroup(String googleId, PrivateGroupRequestDTO request) {
        UserEntity owner = userRepository.findByGoogleId(googleId).orElseThrow();

        String inviteCode = generateInviteCode();

        PrivateGroupEntity group = PrivateGroupEntity.builder()
                .name(request.name())
                .inviteCode(inviteCode)
                .owner(owner)
                .users(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        group.getUsers().add(owner);

        if (privateGroupRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Ya existe un grupo con ese nombre");
        }

        group = privateGroupRepository.save(group);

        return toDTO(group, true, true);
    }

    private String generateInviteCode() {
        String code;
        do {
            code = randomCode();
        } while (privateGroupRepository.findByInviteCode(code).isPresent());
        return code;
    }

    private String randomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(characters.charAt(random.nextInt(characters.length())));
        }
        return code.toString();
    }

    public void joinGroup(String googleId, String inviteCode) {
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();
        PrivateGroupEntity group = privateGroupRepository.findByInviteCode(inviteCode).orElseThrow();

        boolean alreadyJoined = group.getUsers().stream()
                .anyMatch(member -> member.getId().equals(user.getId()));

        if (alreadyJoined) {
            log.info("[{}] Usuario ya existe en grupo", PrivateGroupService.class.getSimpleName());
            return;
        }

        group.getUsers().add(user);
        privateGroupRepository.save(group);

        log.info("[{}] Usuario {} se unió al grupo {}",
                PrivateGroupService.class.getSimpleName(), user.getEmail(), group.getName());
    }

    public void leaveGroup(UUID groupId, String googleId) {
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();
        PrivateGroupEntity group = privateGroupRepository.findById(groupId).orElseThrow();

        if (group.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("El owner no puede salir del grupo. Podés eliminarlo.");
        }

        group.getUsers().removeIf(member -> member.getId().equals(user.getId()));
        privateGroupRepository.save(group);

        log.info("[{}] Usuario {} salió del grupo {}",
                PrivateGroupService.class.getSimpleName(), user.getEmail(), group.getName());
    }

    public List<PrivateGroupResponseDTO> getMyGroups(String googleId) {
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();
        return user.getGroups().stream()
                .map(group -> toDTO(group, group.getOwner().getId().equals(user.getId()), true))
                .toList();
    }

    public PrivateGroupResponseDTO getGroup(UUID groupId, String googleId) {
        PrivateGroupEntity group = privateGroupRepository.findById(groupId).orElseThrow();
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();

        boolean isOwner = group.getOwner().getId().equals(user.getId());
        boolean isMember = group.getUsers().stream().anyMatch(m -> m.getId().equals(user.getId()));

        return toDTO(group, isOwner, isMember);
    }

    public PrivateGroupResponseDTO getGroupByInviteCode(String inviteCode) {
        PrivateGroupEntity group = privateGroupRepository.findByInviteCode(inviteCode).orElseThrow();
        return toDTO(group, false, false);
    }

    public Object getGroupRanking(UUID groupId) {
        PrivateGroupEntity group = privateGroupRepository.findById(groupId).orElseThrow();
        return group.getUsers().stream()
                .sorted(Comparator.comparing(UserEntity::getTotalPoints).reversed())
                .map(user -> new GroupRankingResponseDTO(
                        user.getId(),
                        user.getName(),
                        user.getTotalPoints(),
                        user.getPictureUrl()
                ))
                .toList();
    }

    public void deleteGroup(UUID groupId, String googleId) {
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();
        PrivateGroupEntity group = privateGroupRepository.findById(groupId).orElseThrow();

        if (!group.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Solo el owner puede eliminar el grupo");
        }

        privateGroupRepository.delete(group);
    }

    private PrivateGroupResponseDTO toDTO(PrivateGroupEntity group, boolean isOwner, boolean isMember) {
        return new PrivateGroupResponseDTO(
                group.getId(),
                group.getName(),
                group.getInviteCode(),
                JOIN_PATH + group.getInviteCode(),
                isOwner,
                isMember
        );
    }
}