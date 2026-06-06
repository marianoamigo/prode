package com.prode.worldcup.infrastructure.bootstrap;

import com.prode.worldcup.infrastructure.persistence.entity.GroupEntity;
import com.prode.worldcup.infrastructure.persistence.entity.MatchEntity;
import com.prode.worldcup.infrastructure.persistence.entity.TeamEntity;
import com.prode.worldcup.infrastructure.persistence.repository.GroupRepository;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import com.prode.worldcup.infrastructure.persistence.repository.TeamRepository;
import com.prode.worldcup.shared.MatchStage;
import com.prode.worldcup.shared.MatchStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("local")
public class DataLoader implements CommandLineRunner {

    private final GroupRepository groupRepository;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;

    @Override
    public void run(String... args) {

        log.info("[{}] Iniciando DataLoader...",
                DataLoader.class.getSimpleName());

        if (teamRepository.count() > 0) {
            log.info("[{}] Datos ya cargados. Se omite DataLoader.",
                    DataLoader.class.getSimpleName());
            return;
        }

        log.info("[{}] Iniciando carga de datos...",
                DataLoader.class.getSimpleName());

        // ===== GROUP =====

        GroupEntity groupB = GroupEntity.builder()
                .name("B")
                .build();

        groupB = groupRepository.save(groupB);

        // ===== TEAMS =====

        TeamEntity espana = TeamEntity.builder()
                .name("España")
                .code("es")
                .group(groupB)
                .build();

        TeamEntity francia = TeamEntity.builder()
                .name("Francia")
                .code("fr")
                .group(groupB)
                .build();

        espana = teamRepository.save(espana);
        francia = teamRepository.save(francia);

        // ===== MATCH =====

        MatchEntity espanaVsFrancia = MatchEntity.builder()
                .homeTeam(espana)
                .awayTeam(francia)
                .stage(MatchStage.GROUP_STAGE)
                .status(MatchStatus.SCHEDULED)
                .homeScore(null)
                .awayScore(null)
                .dateTime(LocalDateTime.now().plusDays(3))
                .build();

        matchRepository.save(espanaVsFrancia);

        log.info("[{}] Datos cargados correctamente.",
                DataLoader.class.getSimpleName());
    }
}
