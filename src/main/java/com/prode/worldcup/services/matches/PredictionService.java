package com.prode.worldcup.services.matches;

import com.prode.worldcup.domain.dtos.request.PredictionRequestDTO;
import com.prode.worldcup.domain.dtos.response.PredictionResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.infrastructure.persistence.repository.PredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    public /*PredictionResponseDTO*/ void saveOrUpdatePrediction(
            String googleId,
            PredictionRequestDTO request
    ) {
        UserEntity user = userRepository
                .findByGoogleId(googleId)
                .orElseThrow();

        MatchEntity match = matchRepository
                .findById(request.matchId())
                .orElseThrow();

        if(match.getStatus() != MatchStatus.SCHEDULED) {
            throw new RuntimeException(
                    "Partido comenzado"
            );
        }

        Optional<PredictionEntity> existing =
                predictionRepository
                        .findByUserIdAndMatchId(
                                user.getId(),
                                match.getId()
                        );
    if(existing.isPresent()) {

        PredictionEntity prediction = existing.get();

        prediction.setPredictionHomeScore(
                request.homeScore());

        prediction.setPredictionAwayScore(
                request.awayScore());

        predictionRepository.save(prediction);

    } else {

        PredictionEntity prediction = PredictionEntity.builder()
                        .user(user)
                        .match(match)
                        .predictionHomeScore(
                                request.homeScore())
                        .predictionAwayScore(
                                request.awayScore())
                        .createdAt(LocalDateTime.now())
                        .build();

        predictionRepository.save(prediction);

    }

    }



}

