package com.prode.worldcup.services.group;

import com.prode.worldcup.domain.dtos.request.GroupPredictionRequestDTO;
import com.prode.worldcup.domain.dtos.request.GroupPredictionSaveRequestDTO;
import com.prode.worldcup.infrastructure.persistence.entity.*;
import com.prode.worldcup.infrastructure.persistence.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    @Transactional
    public void savePrediction(String googleId,GroupPredictionSaveRequestDTO request) {
        UserEntity user =
                userRepository
                        .findByGoogleId(
                                googleId
                        )
                        .orElseThrow();
        groupPredictionRepository
                .deleteByUserIdAndGroupId(
                        user.getId(),
                        request.groupId()
                );
        GroupEntity group =
                groupRepository
                        .findById(
                                request.groupId()
                        )
                        .orElseThrow();
        for(GroupPredictionRequestDTO prediction :request.predictions()){
            TeamEntity team =
                    teamRepository
                            .findById(
                                    prediction.teamId()
                            )
                            .orElseThrow();
            groupPredictionRepository.save(

                    GroupPredictionEntity
                            .builder()

                            .user(user)

                            .group(group)

                            .team(team)

                            .position(
                                    prediction.position()
                            )

                            .build()
            );
        }


    }

    public List<GroupPredictionEntity>
    findByGroup(String googleId,UUID groupId) {
        UserEntity user =
                userRepository
                        .findByGoogleId(
                                googleId
                        )
                        .orElseThrow();
        return groupPredictionRepository
                .findByUserIdAndGroupId(
                        user.getId(),
                        groupId
                );
    }

    @Transactional
    public void recalculatePoints(UUID groupId) {
        List<GroupStandingEntity> standings=groupStandingRepository.findByGroupIdOrderByPosition(groupId);
        int totalPlayed =
                standings.stream()
                        .mapToInt(
                                GroupStandingEntity::getPlayed
                        )
                        .sum();

        if(totalPlayed < 12){
            return;
        }
        List<GroupPredictionEntity>
                predictions =

                groupPredictionRepository
                        .findByGroupId(
                                groupId
                        );
        Map<UUID,List<GroupPredictionEntity>>
                predictionsByUser =

                predictions.stream()
                        .collect(
                                Collectors.groupingBy(
                                        p ->
                                                p.getUser()
                                                        .getId()
                                )
                        );
        for(
                List<GroupPredictionEntity>
                        userPredictions :

                predictionsByUser.values()
        ){
            UserEntity user =
                    userPredictions
                            .get(0)
                            .getUser();
            int points = 0;
            for (
                    GroupPredictionEntity prediction :
                    userPredictions
            ) {

                GroupStandingEntity standing =

                        standings.stream()
                                .filter(s ->

                                        s.getTeam()
                                                .getId()
                                                .equals(

                                                        prediction
                                                                .getTeam()
                                                                .getId()
                                                )
                                )
                                .findFirst()
                                .orElse(null);

                if (
                        standing != null
                                &&
                                standing.getPosition()
                                        .equals(
                                                prediction
                                                        .getPosition()
                                        )
                ) {

                    points += 3;
                }
            }

            int alreadyAwarded =
                    userPredictions
                            .get(0)
                            .getPointsScored();

            if(alreadyAwarded > 0){
                continue;
            }

            user.setTotalPoints(
                    user.getTotalPoints()
                            + points
            );

            userRepository.save(
                    user
            );

            for(
                    GroupPredictionEntity prediction :
                    userPredictions
            ){

                prediction.setPointsScored(
                        points
                );

                groupPredictionRepository.save(
                        prediction
                );
            }
            }

        }




}

