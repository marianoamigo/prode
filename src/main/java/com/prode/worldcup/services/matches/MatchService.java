package com.prode.worldcup.services.matches;

import com.prode.worldcup.domain.dtos.request.MatchResultRequestDTO;
import com.prode.worldcup.domain.dtos.response.MatchResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.services.group.GroupStandingService;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PredictionService predictionService;
    private final GroupStandingService groupStandingService;

    public List<MatchResponseDTO> findAll() {
        return matchRepository.findAll()
                .stream()
                .map(match -> new MatchResponseDTO(
                        match.getId(),
                        match.getHomeTeam().getName(),
                        "https://flagcdn.com/24x18/"
                                + match.getHomeTeam().getCode()
                                + ".png",
                        match.getAwayTeam().getName(),
                        "https://flagcdn.com/24x18/"
                                + match.getAwayTeam().getCode()
                                + ".png",
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

        if(match.getStatus() == MatchStatus.FINISHED) return;

        match.setHomeScore(
                request.homeScore()
        );

        match.setAwayScore(
                request.awayScore()
        );

        log.info(" [[ MATCH SERVICE ]] FINISHED REQUEST : {}",request.finished());

        if(Boolean.TRUE.equals(request.finished())){
            match.setStatus(MatchStatus.FINISHED);
            predictionService
                    .recalculatePointsForMatch(
                            match
                    );

            if (match.getStage() == MatchStage.GROUP_STAGE) {
                groupStandingService
                        .recalculateGroup(match
                                .getHomeTeam()
                                .getGroup()
                                .getId());
            }
        } else match.setStatus(MatchStatus.LIVE);


        log.info(" [[ MATCH SERVICE ]] status final : {}",match.getStatus());
        matchRepository.save(match);


    }

}
