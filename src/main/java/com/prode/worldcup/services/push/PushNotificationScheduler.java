package com.prode.worldcup.services.push;

import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.shared.MatchStage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PushNotificationScheduler {

    private final PushNotificationService pushService;
    private final MatchRepository matchRepository;

    // Runs daily at 8:00 AM Argentina time (UTC-3)
    @Scheduled(cron = "0 0 8 * * *", zone = "America/Argentina/Buenos_Aires")
    public void sendDailyNotifications() {
        if (!pushService.isEnabled()) {
            log.debug("Push service not enabled, skipping scheduled notifications.");
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atTime(LocalTime.MIN);
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<MatchEntity> todayMatches = matchRepository.findByDateTimeBetween(startOfDay, endOfDay);
        log.info("Scheduler: {} matches today ({})", todayMatches.size(), today);

        checkArgentinaMatches(todayMatches);
        checkMatchdayStart(today);
        checkKnockoutRounds(todayMatches);
    }

    private void checkArgentinaMatches(List<MatchEntity> todayMatches) {
        for (MatchEntity match : todayMatches) {
            if (match.getStage() != MatchStage.GROUP_STAGE) continue;

            String homeCode = match.getHomeTeam() != null ? match.getHomeTeam().getCode() : "";
            String awayCode = match.getAwayTeam() != null ? match.getAwayTeam().getCode() : "";

            if ("ar".equalsIgnoreCase(homeCode) || "ar".equalsIgnoreCase(awayCode)) {
                String rival = "ar".equalsIgnoreCase(homeCode)
                        ? match.getAwayTeam().getName()
                        : match.getHomeTeam().getName();

                pushService.sendToAll(
                        "Hoy juega La Selección 🇦🇷",
                        "Argentina vs " + rival + " — ¿Ya pronosticaste?"
                );
                return;
            }
        }
    }

    private void checkMatchdayStart(LocalDate today) {
        // Fecha 1: June 11, 2026 (first match of the World Cup)
        if (today.equals(LocalDate.of(2026, 6, 11))) {
            pushService.sendToAll(
                    "🏆 Hoy arranca el Mundial!",
                    "¡No te olvides de pronosticar tus partidos y grupos!"
            );
            return;
        }
        // Fecha 2: June 18, 2026
        if (today.equals(LocalDate.of(2026, 6, 18))) {
            pushService.sendToAll(
                    "Hoy arranca la Fecha 2 ⚽",
                    "¡No te olvides de pronosticar!"
            );
            return;
        }
        // Fecha 3: June 24, 2026
        if (today.equals(LocalDate.of(2026, 6, 24))) {
            pushService.sendToAll(
                    "Hoy arranca la Fecha 3 ⚽",
                    "¡Última fecha de grupos — no te olvides de pronosticar!"
            );
        }
    }

    private void checkKnockoutRounds(List<MatchEntity> todayMatches) {
        LocalDate today = LocalDate.now();
        for (MatchEntity match : todayMatches) {
            MatchStage stage = match.getStage();
            if (stage == MatchStage.GROUP_STAGE) continue;

            // Only notify on the very first day that stage has matches
            LocalDate firstDay = matchRepository.findByStage(stage).stream()
                    .map(m -> m.getDateTime().toLocalDate())
                    .min(java.util.Comparator.naturalOrder())
                    .orElse(null);
            if (!today.equals(firstDay)) continue;

            switch (stage) {
                case ROUND_OF_32 -> {
                    pushService.sendToAll("Hoy arrancan los 16avos 🔥", "¡No te olvides de pronosticar!");
                    return;
                }
                case ROUND_OF_16 -> {
                    pushService.sendToAll("Hoy arrancan los octavos 🔥", "¡No te olvides de pronosticar!");
                    return;
                }
                case QUARTER_FINAL -> {
                    pushService.sendToAll("Hoy arrancan los cuartos de final 🔥", "¡No te olvides de pronosticar!");
                    return;
                }
                case SEMI_FINAL -> {
                    pushService.sendToAll("Hoy arrancan las semifinales ⚔️", "¿Ya sabés quiénes llegan a la final?");
                    return;
                }
                case THIRD_PLACE -> {
                    pushService.sendToAll("Hoy es el partido por tercer puesto 🥉", "¡Pronosticá quién llega al podio!");
                    return;
                }
                case FINAL -> {
                    pushService.sendToAll("Hoy es la FINAL 🏆", "¿Quién se lleva la copa?");
                    return;
                }
                default -> {}
            }
        }
    }
}
