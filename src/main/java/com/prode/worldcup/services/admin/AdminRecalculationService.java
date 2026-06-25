package com.prode.worldcup.services.admin;

import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.*;
import com.prode.worldcup.services.champion.ChampionPredictionService;
import com.prode.worldcup.services.group.GroupPredictionService;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRecalculationService {

    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final GroupPredictionRepository groupPredictionRepository;
    private final ChampionPredictionRepository championPredictionRepository;
    private final MatchRepository matchRepository;
    private final GroupRepository groupRepository;
    private final GroupPredictionService groupPredictionService;
    private final ChampionPredictionService championPredictionService;

    @Transactional
    public void recalculateEverything() {
        log.info("[AdminRecalculation] Iniciando recálculo completo...");

        // 1. Resetear totalPoints de todos los usuarios a 0
        userRepository.findAll().forEach(u -> {
            u.setTotalPoints(0);
            userRepository.save(u);
        });

        // 2. Resetear pointsScored de todos los pronósticos de partidos a 0
        predictionRepository.findAll().forEach(p -> {
            p.setPointsScored(0);
            predictionRepository.save(p);
        });

        // 3. Resetear pointsScored de todos los pronósticos de grupos a 0
        groupPredictionRepository.findAll().forEach(gp -> {
            gp.setPointsScored(0);
            groupPredictionRepository.save(gp);
        });

        // 4. Resetear pointsScored de todos los pronósticos de candidatos a 0
        championPredictionRepository.findAll().forEach(cp -> {
            cp.setPointsScored(0);
            championPredictionRepository.save(cp);
        });

        // 5. Recalcular puntos de partidos FINISHED y acumular en totalPoints
        matchRepository.findAll().stream()
                .filter(m -> m.getStatus() == MatchStatus.FINISHED)
                .forEach(this::recalculateMatch);

        // 6. Recalcular puntos de pronósticos de grupos (force, alreadyAwarded=0)
        groupRepository.findAll()
                .forEach(g -> groupPredictionService.forceRecalculatePoints(g.getId()));

        // 7. Recalcular puntos de candidatos
        championPredictionService.recalculateAllChampionPoints();

        log.info("[AdminRecalculation] Recálculo completo finalizado.");
    }

    private void recalculateMatch(MatchEntity match) {
        predictionRepository.findByMatchId(match.getId()).forEach(pred -> {
            int pts = calculatePoints(pred, match);
            pred.setPointsScored(pts);
            predictionRepository.save(pred);

            // Leer usuario fresco del session cache (mismo @Transactional = misma sesión JPA)
            UserEntity user = userRepository.findById(pred.getUser().getId()).orElseThrow();
            user.setTotalPoints(user.getTotalPoints() + pts);
            userRepository.save(user);
        });
    }

    private int calculatePoints(PredictionEntity pred, MatchEntity match) {
        if (match.getHomeScore() == null || match.getAwayScore() == null) return 0;

        boolean isFinalStage = match.getStage() != MatchStage.GROUP_STAGE;
        boolean exactScore = pred.getPredictionHomeScore().equals(match.getHomeScore())
                && pred.getPredictionAwayScore().equals(match.getAwayScore());

        if (exactScore) return isFinalStage ? 6 : 3;

        int predResult = Integer.compare(pred.getPredictionHomeScore(), pred.getPredictionAwayScore());
        int realResult = Integer.compare(match.getHomeScore(), match.getAwayScore());
        if (predResult == realResult) return isFinalStage ? 3 : 1;

        if (isFinalStage) {
            boolean homeMatch = pred.getPredictionHomeScore().equals(match.getHomeScore());
            boolean awayMatch = pred.getPredictionAwayScore().equals(match.getAwayScore());
            if (homeMatch || awayMatch) return 1;
        }

        return 0;
    }
}
