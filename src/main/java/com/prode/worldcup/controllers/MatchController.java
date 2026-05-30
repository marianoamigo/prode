package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.response.MatchResponseDTO;
import com.prode.worldcup.services.matches.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/all")
    public List<MatchResponseDTO> findAll() {
        return matchService.findAll();
    }
}
