package com.prode.worldcup.services.matches;

import com.prode.worldcup.domain.dtos.request.MatchResultRequestDTO;
import com.prode.worldcup.domain.dtos.response.MatchResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.services.champion.ChampionPredictionService;
import com.prode.worldcup.services.group.GroupStandingService;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PredictionService predictionService;
    private final GroupStandingService groupStandingService;
    private final ChampionPredictionService championPredictionService;

    public List<MatchResponseDTO> findAll() {
        return matchRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public void updateResult(MatchResultRequestDTO request) {
        MatchEntity match = matchRepository.findById(request.matchId()).orElseThrow();

        if (match.getStatus() == MatchStatus.FINISHED) return;

        match.setHomeScore(request.homeScore());
        match.setAwayScore(request.awayScore());

        if (request.homePenaltyScore() != null && request.awayPenaltyScore() != null) {
            match.setHomePenaltyScore(request.homePenaltyScore());
            match.setAwayPenaltyScore(request.awayPenaltyScore());
        }

        log.info(" [[ MATCH SERVICE ]] FINISHED REQUEST : {}", request.finished());

        if (Boolean.TRUE.equals(request.finished())) {
            match.setStatus(MatchStatus.FINISHED);
            matchRepository.save(match);
            predictionService.recalculatePointsForMatch(match);

            if (match.getStage() == MatchStage.GROUP_STAGE) {
                groupStandingService.recalculateGroup(match.getHomeTeam().getGroup().getId());
            }

            if (match.getStage() == MatchStage.FINAL || match.getStage() == MatchStage.THIRD_PLACE) {
                championPredictionService.recalculateAllChampionPoints();
            }

            // Auto-advance bracket
            advanceBracket(match);

        } else {
            match.setStatus(MatchStatus.LIVE);
        }

        log.info(" [[ MATCH SERVICE ]] status final : {}", match.getStatus());
        matchRepository.save(match);
    }

    @Transactional
    public void recalculateMatch(UUID matchId) {
        MatchEntity match = matchRepository.findById(matchId).orElseThrow();
        predictionService.recalculatePointsForMatch(match);
        if (match.getStage() == MatchStage.GROUP_STAGE) {
            groupStandingService.recalculateGroup(match.getHomeTeam().getGroup().getId());
        }
        if (match.getStage() == MatchStage.FINAL || match.getStage() == MatchStage.THIRD_PLACE) {
            championPredictionService.recalculateAllChampionPoints();
        }
        log.info("[[ MATCH SERVICE ]] recalculateMatch: recalculated for matchId={}", matchId);
    }

    public void recalculateAllFinishedMatches() {
        matchRepository.findAll().stream()
                .filter(m -> m.getStatus() == MatchStatus.FINISHED)
                .forEach(predictionService::recalculatePointsForMatch);
        log.info("[[ MATCH SERVICE ]] recalculateAllFinishedMatches: done");
    }

    @Transactional
    public void resetMatch(UUID matchId) {
        MatchEntity match = matchRepository.findById(matchId).orElseThrow();
        match.setStatus(MatchStatus.SCHEDULED);
        match.setHomeScore(null);
        match.setAwayScore(null);
        match.setHomePenaltyScore(null);
        match.setAwayPenaltyScore(null);
        match.setTimeElapsed(null);
        matchRepository.save(match);
        predictionService.recalculatePointsForMatch(match);
        if (match.getStage() == MatchStage.GROUP_STAGE) {
            groupStandingService.recalculateGroup(match.getHomeTeam().getGroup().getId());
        }
        log.info("[[ MATCH SERVICE ]] resetMatch: reset matchId={}", matchId);
    }

    public List<MatchResponseDTO> getMatchesByTeam(String teamName) {
        return matchRepository.findAll().stream()
                .filter(m -> (m.getHomeTeam() != null && m.getHomeTeam().getName().equalsIgnoreCase(teamName))
                          || (m.getAwayTeam() != null && m.getAwayTeam().getName().equalsIgnoreCase(teamName)))
                .sorted((a, b) -> {
                    if (a.getDateTime() == null) return 1;
                    if (b.getDateTime() == null) return -1;
                    return a.getDateTime().compareTo(b.getDateTime());
                })
                .map(this::mapToDTO)
                .toList();
    }

    public List<MatchResponseDTO> getLiveMatches() {
        return matchRepository.findAll().stream()
                .filter(match -> match.getStatus() == MatchStatus.LIVE)
                .map(this::mapToDTO)
                .toList();
    }

    public List<MatchResponseDTO> getMatchesByDate(LocalDate date) {
        return matchRepository.findAll().stream()
                .filter(match ->
                        (match.getStatus() == MatchStatus.LIVE
                                && date.equals(LocalDate.now(java.time.ZoneId.of("America/Argentina/Buenos_Aires"))))
                                || (match.getStatus() != MatchStatus.LIVE
                                && match.getDateTime() != null
                                && match.getDateTime().toLocalDate().equals(date))
                )
                .map(this::mapToDTO)
                .toList();
    }

    // ── Bracket auto-progression ─────────────────────────────

    @Transactional
    public void recalculateBracket() {
        for (int n = 1; n <= 30; n++) {
            final int num = n;
            matchRepository.findByMatchNumber(num).ifPresent(match -> {
                if (match.getStatus() == MatchStatus.FINISHED) {
                    advanceBracket(match);
                }
            });
        }
        log.info("[[ BRACKET ]] recalculateBracket completed");
    }

    @Transactional
    protected void advanceBracket(MatchEntity match) {
        Integer n = match.getMatchNumber();
        if (n == null) return;

        TeamEntity winner = resolveWinner(match);
        TeamEntity loser  = resolveLoser(match, winner);

        if (n >= 1 && n <= 16) {
            // ROUND_OF_32 → ROUND_OF_16
            int nextNum = 17 + (n - 1) / 2;
            boolean asHome = (n % 2 == 1);
            assignTeam(nextNum, winner, asHome);

        } else if (n >= 17 && n <= 24) {
            // ROUND_OF_16 → QUARTER_FINAL
            int nextNum = 25 + (n - 17) / 2;
            boolean asHome = ((n - 17) % 2 == 0);
            assignTeam(nextNum, winner, asHome);

        } else if (n >= 25 && n <= 28) {
            // QUARTER_FINAL → SEMI_FINAL
            int nextNum = 29 + (n - 25) / 2;
            boolean asHome = ((n - 25) % 2 == 0);
            assignTeam(nextNum, winner, asHome);

        } else if (n == 29) {
            // SF1 winner → FINAL home; SF1 loser → THIRD_PLACE home
            assignTeam(32, winner, true);
            if (loser != null) assignTeam(31, loser, true);

        } else if (n == 30) {
            // SF2 winner → FINAL away; SF2 loser → THIRD_PLACE away
            assignTeam(32, winner, false);
            if (loser != null) assignTeam(31, loser, false);
        }
    }

    private TeamEntity resolveWinner(MatchEntity match) {
        if (match.getHomeScore() == null || match.getAwayScore() == null) return null;
        if (match.getHomeScore() > match.getAwayScore()) return match.getHomeTeam();
        if (match.getAwayScore() > match.getHomeScore()) return match.getAwayTeam();
        // Draw → decide by penalties
        Integer ph = match.getHomePenaltyScore(), pa = match.getAwayPenaltyScore();
        if (ph != null && pa != null) {
            return ph >= pa ? match.getHomeTeam() : match.getAwayTeam();
        }
        return match.getHomeTeam();
    }

    private TeamEntity resolveLoser(MatchEntity match, TeamEntity winner) {
        if (winner == null) return null;
        return winner.equals(match.getHomeTeam()) ? match.getAwayTeam() : match.getHomeTeam();
    }

    private void assignTeam(int matchNumber, TeamEntity team, boolean asHome) {
        if (team == null) return;
        matchRepository.findByMatchNumber(matchNumber).ifPresent(m -> {
            if (asHome) m.setHomeTeam(team);
            else        m.setAwayTeam(team);
            matchRepository.save(m);
            log.info("[[ BRACKET ]] matchNumber={} ← {} ({})", matchNumber, team.getName(), asHome ? "home" : "away");
        });
    }

    // ── DTO mapping (null-safe for bracket matches without teams) ─

    private MatchResponseDTO mapToDTO(MatchEntity match) {
        String homeTeam = match.getHomeTeam() != null ? match.getHomeTeam().getName() : null;
        String homeFlagUrl = match.getHomeTeam() != null
                ? "/images/flags/" + match.getHomeTeam().getCode() + ".svg" : null;
        String awayTeam = match.getAwayTeam() != null ? match.getAwayTeam().getName() : null;
        String awayFlagUrl = match.getAwayTeam() != null
                ? "/images/flags/" + match.getAwayTeam().getCode() + ".svg" : null;
        String groupName = match.getStage() == MatchStage.GROUP_STAGE && match.getHomeTeam() != null
                ? match.getHomeTeam().getGroup().getName() : null;

        return new MatchResponseDTO(
                match.getId(),
                homeTeam,
                homeFlagUrl,
                awayTeam,
                awayFlagUrl,
                match.getHomeScore(),
                match.getAwayScore(),
                match.getHomePenaltyScore(),
                match.getAwayPenaltyScore(),
                match.getStatus(),
                match.getStage(),
                match.getDateTime(),
                match.getMatchDay(),
                groupName,
                match.getTimeElapsed(),
                match.getMatchNumber()
        );
    }
}
