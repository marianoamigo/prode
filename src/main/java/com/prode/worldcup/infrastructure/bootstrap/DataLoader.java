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
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
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

        GroupEntity groupA = GroupEntity.builder()
                .name("A")
                .build();

        groupA = groupRepository.save(groupA);

        // ===== TEAMS =====

        TeamEntity argentina = TeamEntity.builder()
                .name("Argentina")
                .code("ARG")
                .group(groupA)
                .build();

        TeamEntity brasil = TeamEntity.builder()
                .name("Brasil")
                .code("BRA")
                .group(groupA)
                .build();

        argentina = teamRepository.save(argentina);
        brasil = teamRepository.save(brasil);

        // ===== MATCH =====

        MatchEntity argentinaVsBrasil = MatchEntity.builder()
                .homeTeam(argentina)
                .awayTeam(brasil)
                .stage(MatchStage.GROUP_STAGE)
                .status(MatchStatus.SCHEDULED)
                .homeScore(null)
                .awayScore(null)
                .dateTime(LocalDateTime.now().plusDays(1))
                .build();

        matchRepository.save(argentinaVsBrasil);

        log.info("[{}] Datos cargados correctamente.",
                DataLoader.class.getSimpleName());
    }
}
