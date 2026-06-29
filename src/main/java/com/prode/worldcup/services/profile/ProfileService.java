package com.prode.worldcup.services.profile;

import com.prode.worldcup.domain.dtos.response.ProfilePredictionDTO;
import com.prode.worldcup.domain.dtos.response.ProfileResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.repository.ChampionPredictionRepository;
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
    private final ChampionPredictionRepository championRepo;

    public ProfileResponseDTO getProfile(UUID userId) {
        var user = userRepository.findById(userId).orElseThrow();

        List<ProfilePredictionDTO> predictions = predictionRepository.findByUserId(userId)
                .stream()
                .filter(p -> p.getMatch().getStatus() == MatchStatus.FINISHED)
                .sorted((a, b) -> b.getMatch().getDateTime().compareTo(a.getMatch().getDateTime()))
                .map(p -> {
                    MatchEntity m = p.getMatch();
                    String groupName = m.getStage() == MatchStage.GROUP_STAGE && m.getHomeTeam() != null
                            ? m.getHomeTeam().getGroup().getName()
                            : null;
                    return new ProfilePredictionDTO(
                            m.getHomeTeam() != null ? m.getHomeTeam().getName() : null,
                            m.getHomeTeam() != null ? "/images/flags/" + m.getHomeTeam().getCode() + ".svg" : null,
                            m.getAwayTeam() != null ? m.getAwayTeam().getName() : null,
                            m.getAwayTeam() != null ? "/images/flags/" + m.getAwayTeam().getCode() + ".svg" : null,
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

        var champion = championRepo.findByUserId(userId).orElse(null);
        String championName = champion != null ? champion.getChampion() : null;
        String championFlag = champion != null ? champion.getChampionFlag() : null;

        return new ProfileResponseDTO(
                user.getName(),
                user.getPictureUrl(),
                user.getTotalPoints() != null ? user.getTotalPoints() : 0,
                predictions,
                championName,
                championFlag
        );
    }
}