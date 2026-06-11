package com.prode.worldcup.services.sync;

import com.prode.worldcup.domain.dtos.external.ExternalGame;
import com.prode.worldcup.domain.dtos.external.ExternalTeam;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.services.group.GroupStandingService;
import com.prode.worldcup.services.matches.PredictionService;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveScoreSyncService {

    private final MatchRepository matchRepository;
    private final PredictionService predictionService;
    private final GroupStandingService groupStandingService;

    @Value("${worldcup.api.base-url:https://worldcup26.ir}")
    private String baseUrl;

    @Value("${worldcup.api.token:}")
    private String apiToken;

    private RestClient restClient;

    // external team id → our ISO code (e.g., "37" → "ar")
    private final Map<String, String> externalIdToCode = new HashMap<>();

    // English team name → our ISO code (for bootstrap mapping)
    private static final Map<String, String> EN_NAME_TO_CODE = Map.ofEntries(
            Map.entry("Mexico", "mx"),
            Map.entry("South Africa", "za"),
            Map.entry("South Korea", "kr"),
            Map.entry("Czech Republic", "cz"), Map.entry("Czechia", "cz"),
            Map.entry("Canada", "ca"),
            Map.entry("Bosnia and Herzegovina", "ba"),
            Map.entry("Qatar", "qa"),
            Map.entry("Switzerland", "ch"),
            Map.entry("Brazil", "br"),
            Map.entry("Morocco", "ma"),
            Map.entry("Haiti", "ht"),
            Map.entry("Scotland", "gb-sct"),
            Map.entry("United States", "us"), Map.entry("USA", "us"),
            Map.entry("Paraguay", "py"),
            Map.entry("Australia", "au"),
            Map.entry("Turkey", "tr"), Map.entry("Turkiye", "tr"), Map.entry("Türkiye", "tr"),
            Map.entry("Germany", "de"),
            Map.entry("Curacao", "cw"), Map.entry("Curaçao", "cw"),
            Map.entry("Ivory Coast", "ci"), Map.entry("Côte d'Ivoire", "ci"), Map.entry("Cote d'Ivoire", "ci"),
            Map.entry("Ecuador", "ec"),
            Map.entry("Netherlands", "nl"), Map.entry("Holland", "nl"),
            Map.entry("Japan", "jp"),
            Map.entry("Sweden", "se"),
            Map.entry("Tunisia", "tn"),
            Map.entry("Belgium", "be"),
            Map.entry("Egypt", "eg"),
            Map.entry("Iran", "ir"),
            Map.entry("New Zealand", "nz"),
            Map.entry("Spain", "es"),
            Map.entry("Cape Verde", "cv"),
            Map.entry("Saudi Arabia", "sa"),
            Map.entry("Uruguay", "uy"),
            Map.entry("France", "fr"),
            Map.entry("Senegal", "sn"),
            Map.entry("Iraq", "iq"),
            Map.entry("Norway", "no"),
            Map.entry("Argentina", "ar"),
            Map.entry("Algeria", "dz"),
            Map.entry("Austria", "at"),
            Map.entry("Jordan", "jo"),
            Map.entry("Portugal", "pt"),
            Map.entry("Congo DR", "cd"), Map.entry("DR Congo", "cd"), Map.entry("Democratic Republic of the Congo", "cd"),
            Map.entry("Uzbekistan", "uz"),
            Map.entry("Colombia", "co"),
            Map.entry("England", "gb-eng"),
            Map.entry("Croatia", "hr"),
            Map.entry("Ghana", "gh"),
            Map.entry("Panama", "pa"), Map.entry("Panamá", "pa")
    );

    @PostConstruct
    public void init() {
        RestClient.Builder builder = RestClient.builder().baseUrl(baseUrl);
        if (apiToken != null && !apiToken.isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + apiToken);
        }
        restClient = builder.build();

        buildTeamMap();
    }

    private void buildTeamMap() {
        try {
            Map<String, List<ExternalTeam>> response = restClient.get()
                    .uri("/get/teams")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            List<ExternalTeam> teams = response != null ? response.get("teams") : null;

            if (teams == null || teams.isEmpty()) {
                log.warn("LiveSync: no teams returned from external API");
                return;
            }

            for (ExternalTeam team : teams) {
                String ourCode = EN_NAME_TO_CODE.get(team.nameEn());
                if (ourCode != null) {
                    externalIdToCode.put(team.id(), ourCode);
                } else {
                    log.warn("LiveSync: no mapping for external team '{}' (id={})", team.nameEn(), team.id());
                }
            }
            log.info("LiveSync: team map built — {} teams mapped", externalIdToCode.size());
        } catch (Exception e) {
            log.error("LiveSync: failed to build team map: {}", e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void syncScores() {
        if (externalIdToCode.isEmpty()) {
            log.warn("LiveSync: team map empty, attempting rebuild...");
            buildTeamMap();
            if (externalIdToCode.isEmpty()) return;
        }

        try {
            Map<String, List<ExternalGame>> response = restClient.get()
                    .uri("/get/games")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            List<ExternalGame> games = response != null ? response.get("games") : null;
            if (games == null || games.isEmpty()) {
                log.debug("LiveSync: no games returned");
                return;
            }

            int updated = 0;
            for (ExternalGame game : games) {
                if (!game.hasKnownTeams()) continue;

                String homeCode = externalIdToCode.get(game.homeTeamId());
                String awayCode = externalIdToCode.get(game.awayTeamId());
                if (homeCode == null || awayCode == null) continue;

                Optional<MatchEntity> matchOpt = matchRepository
                        .findByHomeTeamCodeAndAwayTeamCode(homeCode, awayCode);

                if (matchOpt.isEmpty()) continue;

                MatchEntity match = matchOpt.get();
                boolean changed = false;

                MatchStatus newStatus = resolveStatus(game);
                boolean justFinished = match.getStatus() != MatchStatus.FINISHED
                        && newStatus == MatchStatus.FINISHED;

                if (match.getStatus() != newStatus) {
                    match.setStatus(newStatus);
                    changed = true;
                }

                if (game.isFinished() || game.isLive()) {
                    Integer home = parseScore(game.homeScore());
                    Integer away = parseScore(game.awayScore());
                    if (!Objects.equals(match.getHomeScore(), home)) {
                        match.setHomeScore(home);
                        changed = true;
                    }
                    if (!Objects.equals(match.getAwayScore(), away)) {
                        match.setAwayScore(away);
                        changed = true;
                    }
                }

                String newTimeElapsed = game.isLive() ? game.timeElapsed() : null;
                if (!Objects.equals(match.getTimeElapsed(), newTimeElapsed)) {
                    match.setTimeElapsed(newTimeElapsed);
                    changed = true;
                }

                if (changed) {
                    matchRepository.save(match);
                    updated++;
                    log.info("LiveSync: updated {} vs {} → status={} score={}-{}",
                            homeCode, awayCode, newStatus,
                            match.getHomeScore(), match.getAwayScore());

                    if (justFinished) {
                        predictionService.recalculatePointsForMatch(match);
                        if (match.getStage() == MatchStage.GROUP_STAGE) {
                            groupStandingService.recalculateGroup(
                                    match.getHomeTeam().getGroup().getId());
                        }
                        log.info("LiveSync: recalculated points and standings for {} vs {}",
                                homeCode, awayCode);
                    }
                }
            }

            if (updated > 0) log.info("LiveSync: {} matches updated", updated);

        } catch (Exception e) {
            log.error("LiveSync: sync failed: {}", e.getMessage());
        }
    }

    private MatchStatus resolveStatus(ExternalGame game) {
        if (game.isFinished()) return MatchStatus.FINISHED;
        if (game.isLive()) return MatchStatus.LIVE;
        return MatchStatus.SCHEDULED;
    }

    private Integer parseScore(String score) {
        if (score == null || score.isBlank() || "null".equalsIgnoreCase(score)) return null;
        try { return Integer.parseInt(score.trim()); } catch (NumberFormatException e) { return null; }
    }
}
