package com.prode.worldcup.services.champion;

import com.prode.worldcup.domain.dtos.request.ChampionPredictionRequestDTO;
import com.prode.worldcup.domain.dtos.response.ChampionPredictionResponseDTO;
import com.prode.worldcup.infrastructure.persistence.entity.ChampionPredictionEntity;
import com.prode.worldcup.infrastructure.persistence.repository.ChampionPredictionRepository;
import com.prode.worldcup.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChampionPredictionService {

    private final ChampionPredictionRepository championRepo;
    private final UserRepository userRepository;

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

    @Transactional
    public void save(String googleId, ChampionPredictionRequestDTO req) {
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

    private ChampionPredictionResponseDTO toDTO(ChampionPredictionEntity e) {
        return new ChampionPredictionResponseDTO(
                e.getChampion(), e.getChampionFlag(),
                e.getRunnerUp(), e.getRunnerUpFlag(),
                e.getThird(), e.getThirdFlag(),
                e.getFourth(), e.getFourthFlag()
        );
    }
}
