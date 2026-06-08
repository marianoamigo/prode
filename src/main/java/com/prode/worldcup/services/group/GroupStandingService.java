package com.prode.worldcup.services.group;

import com.prode.worldcup.domain.dtos.response.GroupStandingResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.GroupEntity;
import com.prode.worldcup.infrastructure.persistence.entity.GroupStandingEntity;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import com.prode.worldcup.infrastructure.persistence.repository.GroupRepository;
import com.prode.worldcup.infrastructure.persistence.repository.GroupStandingRepository;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
@Slf4j
@Service
@RequiredArgsConstructor
public class GroupStandingService {

    private final MatchRepository matchRepository;
    private final GroupStandingRepository groupStandingRepository;
    private final GroupRepository groupRepository;
    private final GroupPredictionService groupPredictionService;

    public void recalculateGroup(UUID groupId) {

        GroupEntity group =
                groupRepository
                        .findById(groupId)
                        .orElseThrow();
        List<MatchEntity> matches =
                matchRepository
                        .findByStageAndStatus(
                                MatchStage.GROUP_STAGE,
                                MatchStatus.FINISHED
                        )
                        .stream()
                        .filter(match ->
                                match.getHomeTeam()
                                        .getGroup()
                                        .getId()
                                        .equals(groupId)
                        )
                        .toList();

        Map<UUID, StandingAccumulator> standings = new HashMap<>();
        for(
                TeamEntity team :
                group.getTeams()
        ){

            standings.put(
                    team.getId(),
                    new StandingAccumulator(
                            team
                    )
            );
        }

        for (MatchEntity match : matches) {

            StandingAccumulator home =
                    standings.computeIfAbsent(
                            match.getHomeTeam().getId(),
                            id -> new StandingAccumulator(
                                    match.getHomeTeam()
                            )
                    );

            StandingAccumulator away =
                    standings.computeIfAbsent(
                            match.getAwayTeam().getId(),
                            id -> new StandingAccumulator(
                                    match.getAwayTeam()
                            )
                    );

            home.played++;
            away.played++;

            home.goalsFor += match.getHomeScore();
            home.goalsAgainst += match.getAwayScore();

            away.goalsFor += match.getAwayScore();
            away.goalsAgainst += match.getHomeScore();

            if (match.getHomeScore() > match.getAwayScore()) {

                home.wins++;
                home.points += 3;

                away.losses++;

            } else if (match.getHomeScore() < match.getAwayScore()) {

                away.wins++;
                away.points += 3;

                home.losses++;

            } else {

                home.draws++;
                away.draws++;

                home.points++;
                away.points++;
            }
        }

        List<StandingAccumulator> ordered =
                new ArrayList<>(
                        standings.values()
                );

        ordered.sort(
                Comparator
                        .comparingInt(
                                StandingAccumulator::getPoints
                        )
                        .thenComparingInt(
                                StandingAccumulator::getGoalDifference
                        )
                        .thenComparingInt(
                                StandingAccumulator::getGoalsFor
                        )
                        .reversed()
        );

        applyHeadToHeadIfNeeded(
                ordered,
                matches
        );

        groupStandingRepository.deleteByGroupId(
                groupId
        );

        log.info("[[ GROUP STANDIND SERVICE ]] AFTER DELETE: {}",groupStandingRepository.findByGroupIdOrderByPosition(groupId).size());

        for (int i = 0; i < ordered.size(); i++) {

            StandingAccumulator standing =
                    ordered.get(i);

            groupStandingRepository.save(

                    GroupStandingEntity
                            .builder()

                            .group(
                                    standing.team.getGroup()
                            )

                            .team(
                                    standing.team
                            )

                            .played(
                                    standing.played
                            )

                            .wins(
                                    standing.wins
                            )

                            .draws(
                                    standing.draws
                            )

                            .losses(
                                    standing.losses
                            )

                            .goalsFor(
                                    standing.goalsFor
                            )

                            .goalsAgainst(
                                    standing.goalsAgainst
                            )

                            .goalDifference(
                                    standing.getGoalDifference()
                            )

                            .points(
                                    standing.points
                            )

                            .position(
                                    i + 1
                            )

                            .build()
            );
        }
        groupPredictionService
                .recalculatePoints(
                        groupId
                );
    }

    public List<GroupStandingResponseDTO>
    findByGroupId(
            UUID groupId
    ) {

        return groupStandingRepository
                .findByGroupIdOrderByPosition(
                        groupId
                )
                .stream()
                .map(standing ->

                        new GroupStandingResponseDTO(

                                standing.getPosition(),

                                standing.getTeam()
                                        .getName(),

                                "https://flagcdn.com/24x18/"
                                        + standing.getTeam()
                                        .getCode()
                                        + ".png",

                                standing.getPlayed(),

                                standing.getWins(),

                                standing.getDraws(),

                                standing.getLosses(),

                                standing.getGoalsFor(),

                                standing.getGoalsAgainst(),

                                standing.getGoalDifference(),

                                standing.getPoints()
                        )
                )
                .toList();
    }

    private void applyHeadToHeadIfNeeded(List<StandingAccumulator> ordered, List<MatchEntity> matches) {

        if (matches.size() < 3) {
            return;
        }

        for (int i = 0; i < ordered.size() - 1; i++) {

            StandingAccumulator current =
                    ordered.get(i);

            StandingAccumulator next =
                    ordered.get(i + 1);

            if (
                    current.points != next.points
            ) {
                continue;
            }

            Optional<MatchEntity> directMatch =
                    matches.stream()
                            .filter(match ->

                                    (
                                            match.getHomeTeam()
                                                    .getId()
                                                    .equals(current.team.getId())
                                                    &&
                                                    match.getAwayTeam()
                                                            .getId()
                                                            .equals(next.team.getId())
                                    )

                                            ||

                                            (
                                                    match.getHomeTeam()
                                                            .getId()
                                                            .equals(next.team.getId())
                                                            &&
                                                            match.getAwayTeam()
                                                                    .getId()
                                                                    .equals(current.team.getId())
                                            )
                            )
                            .findFirst();

            if (directMatch.isEmpty()) {
                continue;
            }

            MatchEntity match =
                    directMatch.get();

            TeamEntity winner = null;

            if (match.getHomeScore() > match.getAwayScore()) {

                winner =
                        match.getHomeTeam();

            } else if (
                    match.getAwayScore()
                            > match.getHomeScore()
            ) {

                winner =
                        match.getAwayTeam();
            }

            if (winner == null) {
                continue;
            }

            if (
                    winner.getId()
                            .equals(next.team.getId())
            ) {

                Collections.swap(
                        ordered,
                        i,
                        i + 1
                );
            }
        }
    }

    @Getter
    private static class StandingAccumulator {

        private final TeamEntity team;

        private int played;
        private int wins;
        private int draws;
        private int losses;

        private int goalsFor;
        private int goalsAgainst;

        private int points;

        public StandingAccumulator(
                TeamEntity team
        ) {
            this.team = team;
        }

        public int getGoalDifference() {
            return goalsFor - goalsAgainst;
        }

        public int getGoalsFor() {
            return goalsFor;
        }

        public int getPoints() {
            return points;
        }
    }
}

