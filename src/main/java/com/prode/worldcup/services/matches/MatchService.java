package com.prode.worldcup.services.matches;

import com.prode.worldcup.domain.dtos.request.MatchResultRequestDTO;
import com.prode.worldcup.domain.dtos.response.MatchResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PredictionService predictionService;

    public List<MatchResponseDTO> findAll() {
        return matchRepository.findAll()
                .stream()
                .map(match -> new MatchResponseDTO(
                        match.getId(),
                        match.getHomeTeam().getName(),
                        match.getAwayTeam().getName(),
                        match.getHomeScore(),
                        match.getAwayScore(),
                        match.getStatus(),
                        match.getStage(),
                        match.getDateTime()
                ))
                .toList();
    }

    @Transactional
    public void updateResult(
            MatchResultRequestDTO request
    ) {

        MatchEntity match =
                matchRepository
                        .findById(
                                request.matchId()
                        )
                        .orElseThrow();

        match.setHomeScore(
                request.homeScore()
        );

        match.setAwayScore(
                request.awayScore()
        );

        match.setStatus(
                MatchStatus.FINISHED
        );

        matchRepository.save(match);

        predictionService
                .recalculatePointsForMatch(
                        match
                );
    }

}
