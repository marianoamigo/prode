package com.prode.worldcup.services.profile;

import com.prode.worldcup.domain.dtos.response.ProfilePredictionDTO;
import com.prode.worldcup.domain.dtos.response.ProfileResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.repository.PredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;

    public ProfileResponseDTO getProfile(UUID userId) {
        var user = userRepository.findById(userId).orElseThrow();

        List<ProfilePredictionDTO> predictions = predictionRepository.findByUserId(userId)
                .stream()
                .filter(p -> p.getMatch().getStatus() == MatchStatus.FINISHED)
                .sorted((a, b) -> b.getMatch().getDateTime().compareTo(a.getMatch().getDateTime()))
                .map(p -> {
                    MatchEntity m = p.getMatch();
                    String groupName = m.getStage() == MatchStage.GROUP_STAGE
                            ? m.getHomeTeam().getGroup().getName()
                            : null;
                    return new ProfilePredictionDTO(
                            m.getHomeTeam().getName(),
                            "/images/flags/" + m.getHomeTeam().getCode() + ".svg",
                            m.getAwayTeam().getName(),
                            "/images/flags/" + m.getAwayTeam().getCode() + ".svg",
                            m.getHomeScore(),
                            m.getAwayScore(),
                            p.getPredictionHomeScore(),
                            p.getPredictionAwayScore(),
                            p.getPointsScored() != null ? p.getPointsScored() : 0,
                            m.getDateTime(),
                            m.getStage().name(),
                            groupName
                    );
                })
                .toList();

        return new ProfileResponseDTO(
                user.getName(),
                user.getPictureUrl(),
                user.getTotalPoints() != null ? user.getTotalPoints() : 0,
                predictions
        );
    }
}