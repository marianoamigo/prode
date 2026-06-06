package com.prode.worldcup.services.group;

import com.prode.worldcup.domain.dtos.request.GroupPredictionRequestDTO;
import com.prode.worldcup.domain.dtos.request.GroupPredictionSaveRequestDTO;
import com.prode.worldcup.infrastructure.persistence.entity.GroupEntity;
import com.prode.worldcup.infrastructure.persistence.entity.GroupPredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.GroupPredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.GroupRepository;
import com.prode.worldcup.infrastructure.persistence.repository.TeamRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupPredictionService {
    private final GroupPredictionRepository groupPredictionRepository;
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
}
