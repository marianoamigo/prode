package com.prode.worldcup.services.group;

import com.prode.worldcup.domain.dtos.request.GroupPredictionRequestDTO;
import com.prode.worldcup.domain.dtos.request.GroupPredictionSaveAllRequestDTO;
import com.prode.worldcup.domain.dtos.request.GroupPredictionSaveRequestDTO;
import com.prode.worldcup.domain.dtos.response.GroupPredictionResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.*;
import com.prode.worldcup.infrastructure.persistence.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupPredictionService {
    private final GroupPredictionRepository groupPredictionRepository;
    private final GroupStandingRepository groupStandingRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final TeamRepository teamRepository;

    private static final LocalDateTime LATE_DEADLINE = LocalDateTime.of(2026, 6, 24, 19, 0);

    @Transactional
    public void savePrediction(String googleId, GroupPredictionSaveRequestDTO request) {
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();

        List<GroupPredictionEntity> existing = groupPredictionRepository
                .findByUserIdAndGroupId(user.getId(), request.groupId());
        boolean hasExisting = !existing.isEmpty();
        boolean existingIsLate = hasExisting && existing.stream()
                .anyMatch(p -> Boolean.TRUE.equals(p.getIsLate()));

        boolean markAsLate = !hasExisting || existingIsLate;

        if (markAsLate) {
            LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);
            if (nowUtc.isAfter(LATE_DEADLINE)) {
                throw new RuntimeException("El plazo para pronósticos tardíos ya venció");
            }
        }

        groupPredictionRepository.deleteByUserIdAndGroupId(user.getId(), request.groupId());
        groupPredictionRepository.flush();

        GroupEntity group = groupRepository.findById(request.groupId()).orElseThrow();

        for (GroupPredictionRequestDTO prediction : request.predictions()) {
            if (prediction.position() == null) continue;
            TeamEntity team = teamRepository.findById(prediction.teamId()).orElseThrow();
            groupPredictionRepository.save(
                    GroupPredictionEntity.builder()
                            .user(user)
                            .group(group)
                            .team(team)
                            .position(prediction.position())
                            .isLate(markAsLate)
                            .build()
            );
        }
    }

    @Transactional
    public void saveAllPredictions(String googleId, GroupPredictionSaveAllRequestDTO request) {
        for (GroupPredictionSaveRequestDTO groupPrediction : request.groups()) {
            savePrediction(googleId, groupPrediction);
        }
    }

    public List<GroupPredictionResponseDTO> findByGroupId(String googleId, UUID groupId) {
        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();
        return groupPredictionRepository
                .findByUserIdAndGroupId(user.getId(), groupId)
                .stream()
                .map(prediction ->
                        new GroupPredictionResponseDTO(
                                prediction.getTeam().getId(),
                                prediction.getPosition(),
                                prediction.getIsLate()
                        )
                )
                .toList();
    }

    public List<GroupPredictionResponseDTO> findByUserIdAndGroupId(UUID userId, UUID groupId) {
        return groupPredictionRepository
                .findByUserIdAndGroupId(userId, groupId)
                .stream()
                .map(prediction ->
                        new GroupPredictionResponseDTO(
                                prediction.getTeam().getId(),
                                prediction.getPosition(),
                                prediction.getIsLate()
                        )
                )
                .toList();
    }

    public boolean hasMissingGroupPredictions(String googleId) {
        LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);
        if (nowUtc.isAfter(LATE_DEADLINE)) return false;

        UserEntity user = userRepository.findByGoogleId(googleId).orElseThrow();
        long totalGroups = groupRepository.count();
        long predictedGroups = groupPredictionRepository.findGroupIdsByUserId(user.getId()).size();
        return predictedGroups < totalGroups;
    }

    @Transactional
    public void recalculatePoints(UUID groupId) {
        List<GroupStandingEntity> standings = groupStandingRepository.findByGroupIdOrderByPosition(groupId);
        int totalPlayed = standings.stream()
                .mapToInt(GroupStandingEntity::getPlayed)
                .sum();

        if (totalPlayed < 12) {
            return;
        }

        log.debug("[{}] ---> GRUPO COMPLETADO, ENTRANDO A SUMAR PUNTOS DEL GRUPO", GroupPredictionService.class.getSimpleName());

        List<GroupPredictionEntity> predictions = groupPredictionRepository.findByGroupId(groupId);
        Map<UUID, List<GroupPredictionEntity>> predictionsByUser = predictions.stream()
                .collect(Collectors.groupingBy(p -> p.getUser().getId()));

        for (List<GroupPredictionEntity> userPredictions : predictionsByUser.values()) {
            UserEntity user = userPredictions.get(0).getUser();

            boolean isLate = userPredictions.stream().anyMatch(p -> Boolean.TRUE.equals(p.getIsLate()));
            int pointsPerHit = isLate ? 1 : 3;

            int points = 0;
            for (GroupPredictionEntity prediction : userPredictions) {
                GroupStandingEntity standing = standings.stream()
                        .filter(s -> s.getTeam().getId().equals(prediction.getTeam().getId()))
                        .findFirst()
                        .orElse(null);

                if (standing != null && standing.getPosition().equals(prediction.getPosition())) {
                    points += pointsPerHit;
                }
            }

            int alreadyAwarded = userPredictions.get(0).getPointsScored();

            if (alreadyAwarded > 0) {
                log.info(
                        "[{}] ---> GRUPO {} YA PROCESADO PARA {}",
                        GroupPredictionService.class.getSimpleName(),
                        groupId,
                        user.getName()
                );
                continue;
            }

            log.info(
                    "[{}] ---> GROUP {} USER {} SUMA {} PUNTOS (isLate={})",
                    GroupPredictionService.class.getSimpleName(),
                    groupId,
                    user.getName(),
                    points,
                    isLate
            );

            user.setTotalPoints(user.getTotalPoints() + points);
            userRepository.save(user);

            for (GroupPredictionEntity prediction : userPredictions) {
                prediction.setPointsScored(points);
                groupPredictionRepository.save(prediction);
            }
        }
    }
}
