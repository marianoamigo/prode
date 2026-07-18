package com.prode.worldcup.services.champion;

import com.prode.worldcup.domain.dtos.request.ChampionPredictionRequestDTO;
import com.prode.worldcup.domain.dtos.response.ChampionPredictionResponseDTO;
import com.prode.worldcup.domain.dtos.response.ChampionTableRowResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.ChampionPredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.ChampionPredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChampionPredictionService {

    private final ChampionPredictionRepository championRepo;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    public ChampionPredictionResponseDTO getMineByGoogleId(String googleId) {
        var user = userRepository.findByGoogleId(googleId).orElseThrow();
        return championRepo.findByUserId(user.getId())
                .map(this::toDTO)
                .orElse(new ChampionPredictionResponseDTO(null, null, null, null, null, null, null, null));
    }

    public ChampionPredictionResponseDTO getByUserId(UUID userId) {
        return championRepo.findByUserId(userId)
                .map(this::toDTO)
                .orElse(null);
    }

    private static final LocalDateTime DEADLINE =
            LocalDateTime.of(2026, 6, 27, 23, 59, 59);

    @Transactional
    public void save(String googleId, ChampionPredictionRequestDTO req) {
        if (LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")).isAfter(DEADLINE)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El plazo para modificar candidatos ya venció");
        }
        var user = userRepository.findByGoogleId(googleId).orElseThrow();
        var entity = championRepo.findByUserId(user.getId())
                .orElseGet(() -> ChampionPredictionEntity.builder().user(user).build());

        entity.setChampion(req.champion());
        entity.setChampionFlag(req.championFlag());
        entity.setRunnerUp(req.runnerUp());
        entity.setRunnerUpFlag(req.runnerUpFlag());
        entity.setThird(req.third());
        entity.setThirdFlag(req.thirdFlag());
        entity.setFourth(req.fourth());
        entity.setFourthFlag(req.fourthFlag());
        entity.setUpdatedAt(LocalDateTime.now());
        championRepo.save(entity);
    }

    @Transactional
    public void recalculateAllChampionPoints() {
        MatchEntity finalMatch = matchRepository.findAll().stream()
                .filter(m -> m.getStage() == MatchStage.FINAL && m.getStatus() == MatchStatus.FINISHED)
                .findFirst().orElse(null);

        MatchEntity thirdPlaceMatch = matchRepository.findAll().stream()
                .filter(m -> m.getStage() == MatchStage.THIRD_PLACE && m.getStatus() == MatchStatus.FINISHED)
                .findFirst().orElse(null);

        String actual1 = null, actual2 = null, actual3 = null, actual4 = null;

        if (finalMatch != null) {
            String winner = determineWinner(finalMatch);
            if (winner != null) {
                actual1 = winner;
                actual2 = winner.equals(finalMatch.getHomeTeam().getName())
                        ? finalMatch.getAwayTeam().getName()
                        : finalMatch.getHomeTeam().getName();
            }
        }

        if (thirdPlaceMatch != null) {
            String winner = determineWinner(thirdPlaceMatch);
            if (winner != null) {
                actual3 = winner;
                actual4 = winner.equals(thirdPlaceMatch.getHomeTeam().getName())
                        ? thirdPlaceMatch.getAwayTeam().getName()
                        : thirdPlaceMatch.getHomeTeam().getName();
            }
        }

        log.info("[ChampionPrediction] Recalculando candidatos: 1={} 2={} 3={} 4={}", actual1, actual2, actual3, actual4);

        final String a1 = actual1, a2 = actual2, a3 = actual3, a4 = actual4;

        championRepo.findAll().forEach(cp -> {
            int oldPoints = cp.getPointsScored() != null ? cp.getPointsScored() : 0;
            int newPoints = scoreChampionPrediction(cp, a1, a2, a3, a4);
            cp.setPointsScored(newPoints);
            championRepo.save(cp);

            UserEntity user = userRepository.findById(cp.getUser().getId()).orElseThrow();
            user.setTotalPoints(user.getTotalPoints() - oldPoints + newPoints);
            userRepository.save(user);
        });
    }

    /**
     * Tabla de candidatos para el perfil: posiciones 1/2 (campeón/subcampeón) se revelan
     * recién cuando termina la FINAL, y posiciones 3/4 (tercero/cuarto) recién cuando
     * termina el partido por el TERCER PUESTO, sin importar si el resultado ya era
     * deducible antes por el otro partido.
     */
    public List<ChampionTableRowResponseDTO> getTable(UUID userId) {
        var champion = championRepo.findByUserId(userId).orElse(null);
        if (champion == null) return null;

        MatchEntity finalMatch = matchRepository.findAll().stream()
                .filter(m -> m.getStage() == MatchStage.FINAL)
                .findFirst().orElse(null);
        MatchEntity thirdPlaceMatch = matchRepository.findAll().stream()
                .filter(m -> m.getStage() == MatchStage.THIRD_PLACE)
                .findFirst().orElse(null);

        boolean finalRevealed = finalMatch != null && finalMatch.getStatus() == MatchStatus.FINISHED;
        boolean thirdRevealed = thirdPlaceMatch != null && thirdPlaceMatch.getStatus() == MatchStatus.FINISHED;

        String a1 = null, a2 = null, a3 = null, a4 = null;
        String a1Flag = null, a2Flag = null, a3Flag = null, a4Flag = null;

        if (finalRevealed) {
            String winner = determineWinner(finalMatch);
            if (winner != null) {
                boolean homeWon = winner.equals(finalMatch.getHomeTeam().getName());
                a1 = winner;
                a2 = homeWon ? finalMatch.getAwayTeam().getName() : finalMatch.getHomeTeam().getName();
                a1Flag = flagUrl(homeWon ? finalMatch.getHomeTeam() : finalMatch.getAwayTeam());
                a2Flag = flagUrl(homeWon ? finalMatch.getAwayTeam() : finalMatch.getHomeTeam());
            } else {
                finalRevealed = false;
            }
        }

        if (thirdRevealed) {
            String winner = determineWinner(thirdPlaceMatch);
            if (winner != null) {
                boolean homeWon = winner.equals(thirdPlaceMatch.getHomeTeam().getName());
                a3 = winner;
                a4 = homeWon ? thirdPlaceMatch.getAwayTeam().getName() : thirdPlaceMatch.getHomeTeam().getName();
                a3Flag = flagUrl(homeWon ? thirdPlaceMatch.getHomeTeam() : thirdPlaceMatch.getAwayTeam());
                a4Flag = flagUrl(homeWon ? thirdPlaceMatch.getAwayTeam() : thirdPlaceMatch.getHomeTeam());
            } else {
                thirdRevealed = false;
            }
        }

        final String fa1 = a1, fa2 = a2, fa3 = a3, fa4 = a4;

        List<ChampionTableRowResponseDTO> rows = new ArrayList<>();
        rows.add(new ChampionTableRowResponseDTO(1, champion.getChampion(), champion.getChampionFlag(),
                finalRevealed ? a1 : null, finalRevealed ? a1Flag : null,
                finalRevealed ? pointsForPick(champion.getChampion(), 1, fa1, fa2, fa3, fa4) : null));
        rows.add(new ChampionTableRowResponseDTO(2, champion.getRunnerUp(), champion.getRunnerUpFlag(),
                finalRevealed ? a2 : null, finalRevealed ? a2Flag : null,
                finalRevealed ? pointsForPick(champion.getRunnerUp(), 2, fa1, fa2, fa3, fa4) : null));
        rows.add(new ChampionTableRowResponseDTO(3, champion.getThird(), champion.getThirdFlag(),
                thirdRevealed ? a3 : null, thirdRevealed ? a3Flag : null,
                thirdRevealed ? pointsForPick(champion.getThird(), 3, fa1, fa2, fa3, fa4) : null));
        rows.add(new ChampionTableRowResponseDTO(4, champion.getFourth(), champion.getFourthFlag(),
                thirdRevealed ? a4 : null, thirdRevealed ? a4Flag : null,
                thirdRevealed ? pointsForPick(champion.getFourth(), 4, fa1, fa2, fa3, fa4) : null));

        return rows;
    }

    private String flagUrl(TeamEntity team) {
        return team != null ? "/images/flags/" + team.getCode() + ".svg" : null;
    }

    private String determineWinner(MatchEntity match) {
        if (match.getHomeScore() == null || match.getAwayScore() == null) return null;
        if (match.getHomeScore().equals(match.getAwayScore())) {
            if (match.getHomePenaltyScore() == null || match.getAwayPenaltyScore() == null) return null;
            return match.getHomePenaltyScore() > match.getAwayPenaltyScore()
                    ? match.getHomeTeam().getName()
                    : match.getAwayTeam().getName();
        }
        return match.getHomeScore() > match.getAwayScore()
                ? match.getHomeTeam().getName()
                : match.getAwayTeam().getName();
    }

    private int scoreChampionPrediction(ChampionPredictionEntity cp,
                                        String a1, String a2, String a3, String a4) {
        return pointsForPick(cp.getChampion(),  1, a1, a2, a3, a4)
             + pointsForPick(cp.getRunnerUp(),  2, a1, a2, a3, a4)
             + pointsForPick(cp.getThird(),     3, a1, a2, a3, a4)
             + pointsForPick(cp.getFourth(),    4, a1, a2, a3, a4);
    }

    private int pointsForPick(String team, int predictedPos,
                              String a1, String a2, String a3, String a4) {
        if (team == null) return 0;
        Integer actualPos = null;
        if (team.equals(a1)) actualPos = 1;
        else if (team.equals(a2)) actualPos = 2;
        else if (team.equals(a3)) actualPos = 3;
        else if (team.equals(a4)) actualPos = 4;

        if (actualPos == null) return 0;
        if (actualPos.equals(predictedPos)) return 10;

        boolean predictedInFinal = predictedPos <= 2;
        boolean actualInFinal    = actualPos    <= 2;

        if (predictedInFinal == actualInFinal) return 6; // mismo partido, posición invertida
        return 3; // llegó a semis pero equivocó el partido
    }

    private ChampionPredictionResponseDTO toDTO(ChampionPredictionEntity e) {
        return new ChampionPredictionResponseDTO(
                e.getChampion(), e.getChampionFlag(),
                e.getRunnerUp(), e.getRunnerUpFlag(),
                e.getThird(), e.getThirdFlag(),
                e.getFourth(), e.getFourthFlag()
        );
    }
}
