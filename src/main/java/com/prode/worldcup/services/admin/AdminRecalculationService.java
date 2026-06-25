package com.prode.worldcup.services.admin;

import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.PredictionEntity;
import com.prode.worldcup.infrastructure.persistence.entity.UserEntity;
import com.prode.worldcup.infrastructure.persistence.repository.*;
import com.prode.worldcup.services.group.GroupPredictionService;
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
    private final MatchRepository matchRepository;
    private final GroupRepository groupRepository;
    private final GroupPredictionService groupPredictionService;

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

        // 4. Recalcular puntos de partidos FINISHED y acumular en totalPoints
        matchRepository.findAll().stream()
                .filter(m -> m.getStatus() == MatchStatus.FINISHED)
                .forEach(this::recalculateMatch);

        // 5. Recalcular puntos de pronósticos de grupos (force, alreadyAwarded=0)
        groupRepository.findAll()
                .forEach(g -> groupPredictionService.forceRecalculatePoints(g.getId()));

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

        if (pred.getPredictionHomeScore().equals(match.getHomeScore())
                && pred.getPredictionAwayScore().equals(match.getAwayScore())) {
            return 3;
        }

        int predResult = Integer.compare(pred.getPredictionHomeScore(), pred.getPredictionAwayScore());
        int realResult = Integer.compare(match.getHomeScore(), match.getAwayScore());
        return predResult == realResult ? 1 : 0;
    }
}
