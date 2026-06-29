package com.prode.worldcup.services.matches;

import com.prode.worldcup.domain.dtos.request.PredictionRequestDTO;
import com.prode.worldcup.domain.dtos.response.PredictionResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.infrastructure.persistence.repository.PredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.shared.MatchStage;
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

    public PredictionResponseDTO saveOrUpdatePrediction(
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

        PredictionEntity prediction;
        Optional<PredictionEntity> existing =
                predictionRepository
                        .findByUserIdAndMatchId(
                                user.getId(),
                                match.getId()
                        );
        if (existing.isPresent()) {

            prediction = existing.get();

            prediction.setPredictionHomeScore(
                    request.homeScore());

            prediction.setPredictionAwayScore(
                    request.awayScore());


        } else {

            prediction = PredictionEntity.builder()
                    .user(user)
                    .match(match)
                    .predictionHomeScore(
                            request.homeScore())
                    .predictionAwayScore(
                            request.awayScore())
                    .createdAt(LocalDateTime.now())
                    .build();


        }

        prediction = predictionRepository.save(prediction);

        return new PredictionResponseDTO(
                prediction.getId(),
                prediction.getMatch().getId(),
                teamName(prediction.getMatch().getHomeTeam()),
                teamName(prediction.getMatch().getAwayTeam()),
                prediction.getPredictionHomeScore(),
                prediction.getPredictionAwayScore(),
                prediction.getPointsScored()
        );

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
                        teamName(prediction.getMatch().getHomeTeam()),
                        teamName(prediction.getMatch().getAwayTeam()),
                        prediction.getPredictionHomeScore(),
                        prediction.getPredictionAwayScore(),
                        prediction.getPointsScored()
                )).toList();
    }

    private String teamName(com.prode.worldcup.infrastructure.persistence.entity.TeamEntity team) {
        return team != null ? team.getName() : null;
    }

    private int calculatePoints(PredictionEntity prediction, MatchEntity match) {

        if (match.getStatus() != MatchStatus.FINISHED
                || match.getHomeScore() == null
                || match.getAwayScore() == null) {
            return 0;
        }

        boolean isFinalStage = match.getStage() != MatchStage.GROUP_STAGE;

        boolean exactScore = prediction.getPredictionHomeScore().equals(match.getHomeScore())
                && prediction.getPredictionAwayScore().equals(match.getAwayScore());

        if (exactScore) {
            return isFinalStage ? 6 : 3;
        }

        int predictedResult = Integer.compare(
                prediction.getPredictionHomeScore(),
                prediction.getPredictionAwayScore()
        );

        int actualResult = Integer.compare(
                match.getHomeScore(),
                match.getAwayScore()
        );

        if (predictedResult == actualResult) {
            return isFinalStage ? 3 : 1;
        }

        if (isFinalStage) {
            boolean homeMatch = prediction.getPredictionHomeScore().equals(match.getHomeScore());
            boolean awayMatch = prediction.getPredictionAwayScore().equals(match.getAwayScore());
            if (homeMatch || awayMatch) {
                return 1;
            }
        }

        return 0;
    }

    public void recalculatePointsForMatch(MatchEntity match) {

        List<PredictionEntity> predictions = predictionRepository.findByMatchId(match.getId());

        for (PredictionEntity prediction : predictions) {
            int oldPoints = prediction.getPointsScored() != null ? prediction.getPointsScored() : 0;
            int newPoints = calculatePoints(prediction, match);
            prediction.setPointsScored(newPoints);
            predictionRepository.save(prediction);

            UserEntity user = prediction.getUser();
            user.setTotalPoints(user.getTotalPoints() - oldPoints + newPoints);
            userRepository.save(user);
        }
    }

}

