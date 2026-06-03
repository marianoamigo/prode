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
import java.util.List;
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

        if (match.getStatus() != MatchStatus.SCHEDULED) {
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
        if (existing.isPresent()) {

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


    public List<PredictionResponseDTO> getMyPredictions(String googleId) {
        UserEntity user = userRepository
                .findByGoogleId(googleId)
                .orElseThrow();

        List<PredictionEntity> predictions = predictionRepository.findByUserId(user.getId());

        return predictions.stream()
                .map(prediction -> new PredictionResponseDTO(
                        prediction.getId(),
                        prediction.getMatch().getId(),
                        prediction.getMatch().getHomeTeam().getName(),
                        prediction.getMatch().getAwayTeam().getName(),
                        prediction.getPredictionHomeScore(),
                        prediction.getPredictionAwayScore()
                )).toList();
    }

    private int calculatePoints(PredictionEntity prediction,MatchEntity match) {

        if (
                prediction.getPredictionHomeScore()
                        .equals(match.getHomeScore())
                        &&
                        prediction.getPredictionAwayScore()
                                .equals(match.getAwayScore())
        ) {
            return 3;
        }

        int predictedResult =
                Integer.compare(
                        prediction.getPredictionHomeScore(),
                        prediction.getPredictionAwayScore()
                );

        int actualResult =
                Integer.compare(
                        match.getHomeScore(),
                        match.getAwayScore()
                );

        if (predictedResult == actualResult) {
            return 1;
        }

        return 0;
    }

    public void recalculatePointsForMatch(MatchEntity match) {

        List<PredictionEntity> predictions = predictionRepository.findByMatchId(match.getId() );

        for (PredictionEntity prediction : predictions) {

            prediction.setPointsScored( calculatePoints(prediction, match ));

            predictionRepository.save( prediction );
        }
    }

}

