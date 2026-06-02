package com.prode.worldcup.services.matches;

import com.prode.worldcup.domain.dtos.response.MatchResponseDTO;
import com.prode.worldcup.infrastructure.persistence.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;

    public List<MatchResponseDTO> findAll() {
        return matchRepository.findAll()
                .stream()
                .map(match -> new MatchResponseDTO(
                        match.getId(),
                        match.getHomeTeam().getName(),
                        match.getAwayTeam().getName(),
                        match.getHomeScore(),
                        match.getAwayScore(),
                        match.getStatus(),
                        match.getStage(),
                        match.getDateTime()
                ))
                .toList();
    }
}
