package com.prode.worldcup.services.rankings;

import com.prode.worldcup.domain.dtos.response.GlobalRankingResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import com.prode.worldcup.infrastructure.persistence.repository.PredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final UserRepository userRepository;

    public List<GlobalRankingResponseDTO>
    getGlobalRanking() {

        return userRepository
                .findAll()
                .stream()

                .map(user ->
                        new GlobalRankingResponseDTO(
                                user.getName(),
                                user.getTotalPoints(),
                                user.getPictureUrl()
                        )
                )

                .sorted(
                        Comparator.comparing(
                                GlobalRankingResponseDTO::totalPoints
                        ).reversed()
                )

                .toList();
    }

}
