package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.response.GlobalRankingResponseDTO;
import com.prode.worldcup.services.rankings.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ranking")
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/global")
    public List<GlobalRankingResponseDTO>
    getGlobalRanking() {

        return rankingService
                .getGlobalRanking();
    }
}
